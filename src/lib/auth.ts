import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { createNextAuthAdapter } from "@/lib/nextauth-adapter";
import { User } from "@/lib/models/User";
import { VerificationToken } from "@/lib/models/VerificationToken";

const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;
const SESSION_UPDATE_AGE_SEC = 24 * 60 * 60;

function buildFromAddress(): string {
  const email = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USERNAME ?? "noreply@example.com";
  const name = process.env.SMTP_FROM_NAME?.trim();
  if (name) return `${name} <${email}>`;
  return email;
}

function getEmailServerConfig() {
  const host = process.env.SMTP_HOST ?? "localhost";
  const port = parseInt(process.env.SMTP_PORT ?? "587", 10);
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;
  return {
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  };
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SEC,
    updateAge: SESSION_UPDATE_AGE_SEC,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SEC,
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login/verify",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email, provider: "credentials" });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        };
      },
    }),
    ...(process.env.SMTP_HOST
      ? [
          EmailProvider({
            server: getEmailServerConfig(),
            from: buildFromAddress(),
            async sendVerificationRequest({ identifier, url }) {
              const { default: nodemailer } = await import("nodemailer");
              const transport = nodemailer.createTransport(getEmailServerConfig());
              await transport.sendMail({
                to: identifier,
                from: buildFromAddress(),
                subject: "Sign in to AI Chat Portal",
                text: `Open this link to sign in: ${url}`,
                html: `<p>Open this link to sign in: <a href="${url}">${url}</a></p>`,
              });
            },
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      await connectDB();
      const existing = await User.findOne({ email: user.email });
      if (existing) {
        if (account?.provider === "credentials" || account?.provider === "email") return true;
        existing.image = user.image ?? existing.image;
        existing.name = user.name ?? existing.name;
        existing.providerAccountId = account?.providerAccountId ?? null;
        await existing.save();
        return true;
      }
      await User.create({
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: account?.provider === "email" ? new Date() : null,
        provider: account?.provider === "credentials" ? "credentials" : account?.provider === "email" ? "email" : "oauth",
        providerAccountId: account?.providerAccountId ?? null,
      });
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email }).lean();
        if (dbUser) {
          token.sub = dbUser._id.toString();
          token.provider = dbUser.provider;
        } else {
          token.sub = user.id;
          token.provider = "oauth";
        }
        token.email = user.email;
      }
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = token.email ?? undefined;
        session.user.provider = (token.provider as "credentials" | "email" | "oauth") ?? "oauth";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await connectDB();
      const u = await User.findOne({ email: user.email });
      if (u) return;
      await User.create({
        email: user.email!,
        name: user.name ?? null,
        image: user.image ?? null,
        provider: "oauth",
        providerAccountId: null,
      });
    },
  },
  adapter: process.env.SMTP_HOST ? createNextAuthAdapter() : undefined,
};

export async function getVerificationTokenByToken(token: string) {
  await connectDB();
  return VerificationToken.findOne({ token });
}

export async function getVerificationTokenByEmail(email: string) {
  await connectDB();
  return VerificationToken.findOne({ identifier: email });
}
