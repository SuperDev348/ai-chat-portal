"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  PencilIcon,
  CreditCardIcon,
  LockIcon,
  LogOutIcon,
} from "@/components/icons";
import { CloseIcon } from "@/components/icons";
import { LogOutModal } from "./LogOutModal";

export function ProfileBottomSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const [showLogOutModal, setShowLogOutModal] = useState(false);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogOut = () => {
    onClose();
    setShowLogOutModal(true);
  };

  const confirmLogOut = () => {
    setShowLogOutModal(false);
    signOut({ callbackUrl: "/login" });
  };

  if (!open) {
    return showLogOutModal ? (
      <LogOutModal
        open={true}
        onClose={() => setShowLogOutModal(false)}
        onConfirm={confirmLogOut}
      />
    ) : null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        aria-hidden
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-xl lg:hidden dark:bg-slate-900"
        role="dialog"
        aria-label="Profile menu"
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-16 w-16 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xl font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-1">
            <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
              {session?.user?.name ?? "User"}
            </p>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {session?.user?.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="py-2">
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-slate-700 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-800"
          >
            <CreditCardIcon className="h-5 w-5 shrink-0 text-slate-400" />
            Subscription
            <span className="ml-auto rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              Launch
            </span>
          </button>
          <div className="border-t border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-slate-700 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-800"
          >
            <LockIcon className="h-5 w-5 shrink-0 text-slate-400" />
            Change Password
          </button>
          <div className="border-t border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-slate-700 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-800"
          >
            <PencilIcon className="h-5 w-5 shrink-0 text-slate-400" />
            Edit Profile
          </button>
          <div className="border-t border-slate-100 dark:border-slate-800" />
          <button
            type="button"
            onClick={handleLogOut}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-slate-700 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-800"
          >
            <LogOutIcon className="h-5 w-5 shrink-0 text-slate-400" />
            Log Out
          </button>
        </nav>
      </div>
    </>
  );
}
