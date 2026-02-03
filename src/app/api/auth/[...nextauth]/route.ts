import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

async function wrappedHandler(
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  if (!process.env.NEXTAUTH_SECRET?.trim()) {
    console.error(
      "[NextAuth] NEXTAUTH_SECRET is missing or empty. Set it in .env (e.g. run: openssl rand -base64 32)"
    );
  }
  if (!process.env.NEXTAUTH_URL?.trim()) {
    console.error(
      "[NextAuth] NEXTAUTH_URL is missing. Set it in .env (e.g. http://localhost:4000)"
    );
  }
  try {
    return await handler(req, context);
  } catch (err) {
    console.error("[NextAuth] Server error:", err);
    throw err;
  }
}

export const GET = wrappedHandler;
export const POST = wrappedHandler;
