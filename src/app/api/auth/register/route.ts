import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      const message = first ? `${first.path.join(".")}: ${first.message}` : "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { email, password, name } = parsed.data;
    await connectDB();
    const existing = await User.findOne({ email, provider: "credentials" });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      email,
      password: hashed,
      name: name ?? null,
      provider: "credentials",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
