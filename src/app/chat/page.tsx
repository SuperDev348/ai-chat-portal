"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { SidebarDrawer } from "@/components/chat/SidebarDrawer";
import { ProfileDropdown } from "@/components/chat/ProfileDropdown";
import { ChatInput } from "@/components/chat/ChatInput";
import { UnlockFeaturesCard } from "@/components/chat/UnlockFeaturesCard";
import { useQueryClient } from "@tanstack/react-query";

export default function ChatIndexPage() {
  const { status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950">
      <SidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentId={null}
        onNewChat={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
      />
      <aside className="hidden lg:block">
        <Sidebar
          currentId={null}
          onNewChat={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
        />
      </aside>
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50 shadow-sm dark:bg-slate-950">
        <header className="flex shrink-0 items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
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
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-2xl flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                Hello there !
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                I&apos;m your AI chat assistant. Ask me anything to begin!
              </p>
            </div>
            <div className="w-full">
              <ChatInput onSend={() => {}} />
            </div>
          </div>
        </div>
        <div className="w-full">
          <UnlockFeaturesCard />
        </div>
      </main>
    </div>
  );
}
