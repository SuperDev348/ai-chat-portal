"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CloseIcon } from "@/components/icons";

export function EditProfileModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && session?.user) {
      setName(session.user.name ?? "");
      setImage(session.user.image ?? "");
      setError(null);
    }
  }, [open, session?.user?.name, session?.user?.image]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          image: image.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Failed to update profile.");
        return;
      }
      await update({ name: data.name ?? name, image: data.image ?? image });
      onSuccess?.();
      onClose();
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
        <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
          Edit Profile
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="edit-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="edit-image" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Profile image URL
            </label>
            <input
              id="edit-image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="https://..."
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
              disabled={loading}
              className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              style={{ backgroundColor: "#006C67" }}
            >
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
