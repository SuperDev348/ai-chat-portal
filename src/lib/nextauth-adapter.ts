import type { Adapter, AdapterUser } from "next-auth/adapters";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { VerificationToken } from "@/lib/models/VerificationToken";

function toAdapterUser(doc: { _id: unknown; email: string; emailVerified?: Date | null; name?: string | null; image?: string | null }): AdapterUser {
  return {
    id: String(doc._id),
    email: doc.email,
    emailVerified: doc.emailVerified ?? null,
    name: doc.name ?? null,
    image: doc.image ?? null,
  };
}

export function createNextAuthAdapter(): Adapter {
  return {
    async getUserByEmail(email) {
      await connectDB();
      const user = await User.findOne({ email }).lean();
      if (!user) return null;
      return toAdapterUser(user);
    },
    async createUser(newUser: Omit<AdapterUser, "id">) {
      await connectDB();
      const doc = await User.create({
        email: newUser.email,
        emailVerified: newUser.emailVerified ?? null,
        name: newUser.name ?? null,
        image: newUser.image ?? null,
        provider: "email",
        providerAccountId: null,
      });
      return toAdapterUser(doc.toObject());
    },
    async updateUser({ id, ...updates }) {
      await connectDB();
      const doc = await User.findByIdAndUpdate(
        id,
        { $set: updates as Record<string, unknown> },
        { new: true }
      ).lean();
      if (!doc) throw new Error("User not found");
      return toAdapterUser(doc);
    },
    async createVerificationToken(verificationToken) {
      await connectDB();
      const doc = await VerificationToken.create({
        identifier: verificationToken.identifier,
        token: verificationToken.token,
        expires: verificationToken.expires,
      });
      return {
        identifier: doc.identifier,
        token: doc.token,
        expires: doc.expires,
      };
    },
    async useVerificationToken({ identifier, token }) {
      await connectDB();
      const doc = await VerificationToken.findOneAndDelete({
        identifier,
        token,
      });
      if (!doc) return null;
      return {
        identifier: doc.identifier,
        token: doc.token,
        expires: doc.expires,
      };
    },
  };
}
