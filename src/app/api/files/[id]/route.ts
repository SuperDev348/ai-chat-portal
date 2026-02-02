import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { StoredFile } from "@/lib/models/StoredFile";
import { Conversation } from "@/lib/models/Conversation";

export async function GET(
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
    await connectDB();
    const file = await StoredFile.findById(id).lean();
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const conv = await Conversation.findOne({
      _id: file.conversationId,
      userId: session.user.id,
    });
    if (!conv) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const uploadsDir = join(process.cwd(), "uploads");
    const filePath = join(uploadsDir, file.path);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    const download = request.nextUrl.searchParams.get("download") === "1";
    const contentType = file.mimeType || "application/octet-stream";
    const disposition = download ? "attachment" : "inline";
    const filename = file.originalName || "download";
    const buffer = readFileSync(filePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }
}
