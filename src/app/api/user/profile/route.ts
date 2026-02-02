import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  let parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed && !trimmed.startsWith("+")) {
    parsed = parsePhoneNumberFromString(trimmed, "US");
  }
  return !!parsed && parsed.isValid();
}

const phoneSchema = z
  .string()
  .max(30)
  .optional()
  .nullable()
  .refine(
    (v) => {
      if (v == null || v.trim() === "") return true;
      return isValidPhone(v);
    },
    { message: "Please enter a valid phone number." }
  );

const bodySchema = z.object({
  name: z.string().max(200).optional(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  image: z.string().url().optional().nullable(),
  phone: phoneSchema,
  birthday: z.string().max(50).optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      email: user.email,
      name: user.name ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      image: user.image ?? undefined,
      phone: user.phone ?? undefined,
      birthday: user.birthday ?? undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      const message = first ? `${first.path.join(".")}: ${first.message}` : "Invalid input.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { name, firstName, lastName, image, phone, birthday } = parsed.data;
    await connectDB();
    const updatePayload: Record<string, string | null> = {};
    if (name !== undefined) updatePayload.name = name === "" ? null : name;
    if (firstName !== undefined) updatePayload.firstName = firstName === "" ? null : firstName;
    if (lastName !== undefined) updatePayload.lastName = lastName === "" ? null : lastName;
    if (image !== undefined) updatePayload.image = image;
    if (phone !== undefined) updatePayload.phone = phone === "" ? null : phone ?? null;
    if (birthday !== undefined) updatePayload.birthday = birthday === "" ? null : birthday ?? null;
    if (Object.keys(updatePayload).length === 0) {
      const current = await User.findById(session.user.id).lean();
      if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json({
        name: current.name ?? undefined,
        firstName: current.firstName ?? undefined,
        lastName: current.lastName ?? undefined,
        image: current.image ?? undefined,
        phone: current.phone ?? undefined,
        birthday: current.birthday ?? undefined,
      });
    }
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      name: user.name ?? undefined,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      image: user.image ?? undefined,
      phone: user.phone ?? undefined,
      birthday: user.birthday ?? undefined,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
