"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/icons";
import { Sidebar, type ConversationItem } from "@/components/chat/Sidebar";

export function SidebarDrawer({
  open,
  onClose,
  currentId,
  onNewChat,
}: {
  open: boolean;
  onClose: () => void;
  currentId: string | null;
  onNewChat: () => void;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden dark:bg-slate-900"
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
          <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Menu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close menu"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar
            currentId={currentId}
            onNewChat={onNewChat}
            onNavigate={onClose}
            variant="drawer"
          />
        </div>
      </div>
    </>
  );
}
