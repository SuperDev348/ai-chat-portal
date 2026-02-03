"use client";

import Link from "next/link";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          Check your email
        </h1>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          A sign-in link has been sent to your email. Click the link to sign in
          to the AI Chat Portal.
        </p>
        <p className="mb-6 text-xs text-slate-400 dark:text-slate-500">
          If you don&apos;t see it, check your spam folder. The link expires after a short time.
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-teal-600 hover:underline dark:text-teal-400"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
