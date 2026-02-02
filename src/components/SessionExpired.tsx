"use client";

import Link from "next/link";

export function SessionExpired() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
        Session expired
      </p>
      <p className="text-center text-sm text-slate-600 dark:text-slate-400">
        Please sign in again to continue.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Sign in again
      </Link>
    </div>
  );
}
