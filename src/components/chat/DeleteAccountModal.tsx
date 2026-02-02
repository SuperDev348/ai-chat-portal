"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { CloseIcon } from "@/components/icons";

export function DeleteAccountModal({
  open,
  onClose,
  requirePassword,
}: {
  open: boolean;
  onClose: () => void;
  requirePassword: boolean;
}) {
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmValue = "delete my account";
  const canSubmit = requirePassword
    ? password.length > 0 && confirmText.toLowerCase() === confirmValue
    : confirmText.toLowerCase() === confirmValue;

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requirePassword ? { password } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to delete account.");
        return;
      }
      await signOut({ callbackUrl: "/login" });
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label="Close"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/40">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>
        <h3 className="mb-2 text-center text-lg font-semibold text-slate-800 dark:text-slate-200">
          Delete Account
        </h3>
        <p className="mb-4 text-center text-sm text-slate-500 dark:text-slate-400">
          This will permanently delete your account and all your chat history. This action cannot be undone.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              {error}
            </p>
          )}
          {requirePassword && (
            <div>
              <label htmlFor="delete-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Your password
              </label>
              <input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                placeholder="Password"
              />
            </div>
          )}
          <div>
            <label htmlFor="delete-confirm" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Type <strong>{confirmValue}</strong> to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder={confirmValue}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
