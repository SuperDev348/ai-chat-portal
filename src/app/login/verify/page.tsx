"use client";

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="mb-2 text-xl font-semibold text-slate-800 dark:text-slate-100">
          Check your email
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          A sign-in link has been sent to your email. Click the link to sign in
          to the AI Chat Portal.
        </p>
      </div>
    </div>
  );
}
