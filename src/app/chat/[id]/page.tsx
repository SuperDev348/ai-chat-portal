"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { SidebarDrawer } from "@/components/chat/SidebarDrawer";
import { MessageList, type Message } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { ProfileDropdown } from "@/components/chat/ProfileDropdown";
import { UnlockFeaturesCard } from "@/components/chat/UnlockFeaturesCard";
import { ErrorState } from "@/components/ErrorState";
import { SessionExpired } from "@/components/SessionExpired";

const REFETCH_INTERVAL = 3000;

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const id = typeof params.id === "string" ? params.id : null;
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const {
    data: conversation,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/conversations/${id}`);
      if (res.status === 401) return "unauthorized";
      if (!res.ok) throw new Error("Failed to load");
      return res.json() as Promise<{
        id: string;
        title: string;
        messages: Message[];
      }>;
    },
    enabled: !!id && status === "authenticated",
    refetchInterval: REFETCH_INTERVAL,
  });

  function applyMessageSuccess(data: {
    id?: string;
    role?: string;
    content?: string;
    createdAt?: string;
    attachments?: { type: string; url: string; name?: string }[];
    assistantMessage?: { id: string; role: string; content: string; createdAt: string };
    error?: string;
  }) {
    setSendError(data?.error ?? null);
    if (id && data?.assistantMessage && data?.id) {
      queryClient.setQueryData(
        ["conversation", id],
        (prev: { id: string; title: string; messages: Message[] } | undefined) => {
          if (!prev) return prev;
          const existingIds = new Set((prev.messages ?? []).map((m) => m.id));
          const userMsg = {
            id: data.id!,
            role: data.role ?? "user",
            content: data.content ?? "",
            attachments: data.attachments ?? [],
            createdAt: data.createdAt ?? new Date().toISOString(),
          };
          const assistantMsg = {
            id: data.assistantMessage!.id,
            role: data.assistantMessage!.role,
            content: data.assistantMessage!.content,
            createdAt: data.assistantMessage!.createdAt,
          };
          const toAppend = [userMsg, assistantMsg].filter((m) => !existingIds.has(m.id));
          if (toAppend.length === 0) return prev;
          return {
            ...prev,
            messages: [...(prev.messages ?? []), ...toAppend],
          };
        }
      );
    }
    if (id) queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  }

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!id) throw new Error("No conversation");
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, role: "user" }),
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: applyMessageSuccess,
  });

  const sendWithAttachmentsMutation = useMutation({
    mutationFn: async ({ content, files }: { content: string; files: File[] }) => {
      if (!id) throw new Error("No conversation");
      const form = new FormData();
      form.append("content", content);
      files.forEach((f) => form.append("images", f));
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        body: form,
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: applyMessageSuccess,
  });

  const sendAudioMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      if (!id) throw new Error("No conversation");
      const form = new FormData();
      form.append("audio", audioBlob, "audio.webm");
      const res = await fetch(`/api/conversations/${id}/audio`, {
        method: "POST",
        body: form,
      });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: applyMessageSuccess,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (conversation === "unauthorized") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
        <SessionExpired />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
      <SidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentId={id}
        onNewChat={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
      />
      <aside className="hidden lg:block">
        <Sidebar
          currentId={id}
          onNewChat={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
        />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 shadow-sm dark:bg-slate-950">
        <header className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="flex-1 text-center text-lg font-bold text-slate-800 dark:text-slate-200 sm:text-xl lg:text-left">
            AI Chat
          </h1>
          <ProfileDropdown />
        </header>
        {!id ? (
          <div className="flex flex-1 items-center justify-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">Select a chat or start a new one.</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-1 items-center justify-center text-slate-500 dark:text-slate-400">
            <p className="text-sm">Loading conversation…</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <ErrorState
              title="Could not load conversation"
              message="Network or server error. Try again."
              onRetry={() => refetch()}
            />
          </div>
        ) : conversation ? (
          <>
            <MessageList messages={conversation.messages ?? []} />
            {sendError && (
              <div className="px-4 py-2 text-center text-sm text-amber-600 dark:text-amber-400">
                {sendError}
              </div>
            )}
            <UnlockFeaturesCard />
            <ChatInput
              onSend={(content) => {
                setSendError(null);
                sendMutation.mutate(content);
              }}
              onSendWithAttachments={(content, files) => {
                setSendError(null);
                sendWithAttachmentsMutation.mutate({ content, files });
              }}
              onSendAudio={(audioBlob) => {
                setSendError(null);
                sendAudioMutation.mutate(audioBlob);
              }}
              disabled={
                sendMutation.isPending ||
                sendWithAttachmentsMutation.isPending ||
                sendAudioMutation.isPending
              }
            />
          </>
        ) : null}
      </main>
    </div>
  );
}
