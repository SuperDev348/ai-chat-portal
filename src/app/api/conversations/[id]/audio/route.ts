import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import OpenAI, { toFile } from "openai";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";

const MAX_CONTEXT_MESSAGES = 30;

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
    const formData = await request.formData().catch(() => null);
    const audioFile = formData?.get("audio");
    if (!audioFile || !(audioFile instanceof Blob) || audioFile.size === 0) {
      return NextResponse.json(
        { error: "audio file required" },
        { status: 400 }
      );
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Set OPENAI_API_KEY in .env.local" },
        { status: 503 }
      );
    }
    await connectDB();
    const conv = await Conversation.findOne({
      _id: id,
      userId: session.user.id,
    });
    if (!conv) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const openai = new OpenAI({ apiKey: apiKey.trim() });
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const file = await toFile(buffer, "audio.webm", {
      type: audioFile.type || "audio/webm",
    });
    const transcript = await openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });
    const content = (transcript.text ?? "").trim() || "[No speech detected]";
    const msg = await Message.create({
      conversationId: id,
      role: "user",
      content,
    });
    conv.updatedAt = new Date();
    await conv.save();

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
    const message = e instanceof Error ? e.message : "Failed to process audio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
