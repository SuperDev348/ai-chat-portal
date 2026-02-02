import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import OpenAI from "openai";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";
import { StoredFile } from "@/lib/models/StoredFile";
import type { MessageRole } from "@/lib/models/Message";

const roleSchema = ["user", "assistant", "system"] as const;
const MAX_CONTEXT_MESSAGES = 30;
const MAX_ATTACH_FILES = 4;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function getExt(file: File): string {
  const name = file.name || "";
  const ext = name.split(".").pop();
  if (ext && /^[a-z0-9]+$/i.test(ext)) return ext;
  const mime = file.type || "";
  if (mime.startsWith("image/")) return mime.replace("image/", "") || "png";
  return "bin";
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buf = Buffer.from(await blob.arrayBuffer());
  const base64 = buf.toString("base64");
  const type = blob.type || "image/png";
  return `data:${type};base64,${base64}`;
}

function serializeAttachments(
  attachments: unknown
): { type: string; url: string; name?: string }[] {
  if (!Array.isArray(attachments)) return [];
  return attachments.map((a: unknown) => {
    const x = a as Record<string, unknown>;
    return {
      type: typeof x.type === "string" ? x.type : "image",
      url: typeof x.url === "string" ? x.url : "",
      name: typeof x.name === "string" ? x.name : undefined,
    };
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    let content = "";
    let role: (typeof roleSchema)[number] = "user";
    let imageDataUrls: string[] = [];
    let savedAttachments: { type: "image" | "file"; url: string; name: string }[] = [];

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData().catch(() => null);
      if (!formData) {
        return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
      }
      const contentPart = formData.get("content");
      content = typeof contentPart === "string" ? contentPart.trim() : "";
      const files = formData.getAll("images").filter((f): f is File => f instanceof File);
      const validFiles = files
        .filter((f) => f.size > 0 && f.size <= MAX_FILE_SIZE_BYTES)
        .slice(0, MAX_ATTACH_FILES);
      if (validFiles.length > 0) {
        await connectDB();
        const convCheck = await Conversation.findOne({
          _id: id,
          userId: session.user.id,
        });
        if (!convCheck) {
          return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        const uploadsDir = join(process.cwd(), "uploads");
        mkdirSync(uploadsDir, { recursive: true });
        for (const file of validFiles) {
          const ext = getExt(file);
          const diskName = `${randomUUID()}.${ext}`;
          const filePath = join(uploadsDir, diskName);
          const buf = Buffer.from(await file.arrayBuffer());
          writeFileSync(filePath, buf);
          const stored = await StoredFile.create({
            path: diskName,
            originalName: file.name || "file",
            mimeType: file.type || "application/octet-stream",
            conversationId: id,
          });
          savedAttachments.push({
            type: file.type.startsWith("image/") ? "image" : "file",
            url: `/api/files/${stored._id.toString()}`,
            name: file.name || "file",
          });
          if (file.type.startsWith("image/")) {
            const dataUrl = await blobToDataUrl(file);
            imageDataUrls.push(dataUrl);
          }
        }
      }
      if (!content && savedAttachments.length === 0) {
        return NextResponse.json(
          { error: "content or at least one file required" },
          { status: 400 }
        );
      }
      if (!content && savedAttachments.length > 0) {
        content = "[Image(s) attached]";
      }
    } else {
      const body = await request.json().catch(() => ({}));
      content = typeof body.content === "string" ? body.content.trim() : "";
      role = roleSchema.includes(body.role) ? body.role : "user";
      if (!content) {
        return NextResponse.json(
          { error: "content required" },
          { status: 400 }
        );
      }
    }

    await connectDB();
    const conv = await Conversation.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const attachments =
      savedAttachments.length > 0
        ? savedAttachments.map((a) => ({ type: a.type, url: a.url, name: a.name }))
        : undefined;
    const msg = await Message.create({
      conversationId: id,
      role: role as MessageRole,
      content,
      attachments,
    });
    conv.updatedAt = new Date();
    await conv.save();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({
        id: msg._id.toString(),
        role: msg.role,
        content: msg.content,
        attachments: serializeAttachments(msg.attachments),
        createdAt: msg.createdAt.toISOString(),
        assistantMessage: null,
        error: "OpenAI API key is not configured. Set OPENAI_API_KEY in .env.local",
      });
    }

    const recentMessages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(MAX_CONTEXT_MESSAGES)
      .lean();

    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful assistant." },
      ...recentMessages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    if (imageDataUrls.length > 0) {
      const lastUserContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        { type: "text", text: content === "[Image(s) attached]" ? "What’s in these images?" : content },
        ...imageDataUrls.map((url) => ({
          type: "image_url" as const,
          image_url: { url },
        })),
      ];
      openaiMessages[openaiMessages.length - 1] = {
        role: "user",
        content: lastUserContent,
      };
    }

    const openai = new OpenAI({ apiKey: apiKey.trim() });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini",
      messages: openaiMessages,
    });

    const replyContent =
      completion.choices[0]?.message?.content?.trim() ??
      "I couldn't generate a response.";

    const assistantMsg = await Message.create({
      conversationId: id,
      role: "assistant",
      content: replyContent,
    });
    conv.updatedAt = new Date();
    await conv.save();

    return NextResponse.json({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      attachments: serializeAttachments(msg.attachments),
      createdAt: msg.createdAt.toISOString(),
      assistantMessage: {
        id: assistantMsg._id.toString(),
        role: assistantMsg.role,
        content: assistantMsg.content,
        createdAt: assistantMsg.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "Failed to send message";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
