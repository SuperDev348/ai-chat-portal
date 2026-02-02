"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WarpSpeedLogo } from "@/components/WarpSpeedLogo";
import { PlusIcon, ClockIcon, SettingsIcon, HelpIcon, CrownIcon, PersonIcon } from "@/components/icons";

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function Sidebar({
  currentId,
  onNewChat,
  onNavigate,
  variant = "default",
}: {
  currentId: string | null;
  onNewChat: () => void;
  onNavigate?: () => void;
  variant?: "default" | "drawer";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: conversations = [], isLoading, error, refetch } = useQuery<ConversationItem[]>({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New chat" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onNewChat();
      router.push(`/chat/${data.id}`);
    },
  });

  return (
    <aside className={`flex h-full flex-col bg-white dark:bg-slate-900 ${variant === "drawer" ? "w-full" : "w-64"}`}>
      {variant === "default" && (
        <div className="flex items-center gap-2 border-b border-slate-200 p-4 dark:border-slate-700">
          <WarpSpeedLogo className="h-8 w-8 shrink-0" />
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            warpSpeed
          </span>
        </div>
      )}
      <div className="px-3 py-2">
        <button
          type="button"
          onClick={() => {
            createMutation.mutate();
            onNavigate?.();
          }}
          disabled={createMutation.isPending}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <PlusIcon className="h-5 w-5" />
          {createMutation.isPending ? "…" : "New Chat"}
        </button>
        <Link
          href="/chat"
          onClick={onNavigate}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ClockIcon className="h-5 w-5" />
          Chat History
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <SettingsIcon className="h-5 w-5" />
          Settings
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
        >
          <HelpIcon className="h-5 w-5" />
          Help
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {error && (
          <div className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            Could not load chats.{" "}
            <button type="button" onClick={() => refetch()} className="underline">
              Retry
            </button>
          </div>
        )}
        {isLoading && (
          <div className="py-4 text-center text-sm text-slate-500">Loading…</div>
        )}
        {!isLoading && !error && conversations.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-500">
            No conversations yet. Start a new chat.
          </p>
        )}
        {!isLoading &&
          conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              onClick={onNavigate}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                currentId === c.id
                  ? "bg-teal-50 font-medium text-teal-800 dark:bg-teal-900/30 dark:text-teal-200"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <span className="line-clamp-1">{c.title}</span>
            </Link>
          ))}
      </nav>

      <div className="border-slate-200 p-3 dark:border-slate-700">
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <div className="mb-2 flex justify-center">
            <CrownIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="mb-1 text-center text-sm font-bold text-slate-800 dark:text-slate-200">
            Upgrade Your Plan
          </h3>
          <p className="mb-3 text-center text-xs text-slate-600 dark:text-slate-400">
            Enjoy more credits and use even more AI in your day!
          </p>
          <button
            type="button"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            style={{borderRadius: '50px'}}
          >
            Learn More
          </button>
        </div>
      </div>
    </aside>
  );
}
