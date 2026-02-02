import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Conversation } from "@/lib/models/Conversation";
import { Message } from "@/lib/models/Message";

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === "string" ? body.password : undefined;
    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.provider === "credentials" && user.password) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required to delete your account." },
          { status: 400 }
        );
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return NextResponse.json({ error: "Password is incorrect." }, { status: 400 });
      }
    }
    const convos = await Conversation.find({ userId: user._id }).lean();
    const convIds = convos.map((c) => c._id);
    if (convIds.length > 0) {
      await Message.deleteMany({ conversationId: { $in: convIds } });
      await Conversation.deleteMany({ userId: user._id });
    }
    await User.findByIdAndDelete(user._id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
