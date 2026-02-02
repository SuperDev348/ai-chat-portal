import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";
import type { MessageRole } from "@/lib/models/Message";

const roleSchema = ["user", "assistant", "system"] as const;

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
    const body = await request.json().catch(() => ({}));
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const role = roleSchema.includes(body.role) ? body.role : "user";
    if (!content) {
      return NextResponse.json(
        { error: "content required" },
        { status: 400 }
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
    const msg = await Message.create({
      conversationId: id,
      role: role as MessageRole,
      content,
    });
    conv.updatedAt = new Date();
    await conv.save();
    return NextResponse.json({
      id: msg._id.toString(),
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
