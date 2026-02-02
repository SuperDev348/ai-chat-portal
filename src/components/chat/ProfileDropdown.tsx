"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  CreditCardIcon,
  LockIcon,
  TrashIcon,
  LogOutIcon,
} from "@/components/icons";
import { LogOutModal } from "./LogOutModal";
import { ProfileBottomSheet } from "./ProfileBottomSheet";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { DeleteAccountModal } from "./DeleteAccountModal";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [showLogOutModal, setShowLogOutModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleLogOut = () => {
    setOpen(false);
    setShowLogOutModal(true);
  };

  const confirmLogOut = () => {
    setShowLogOutModal(false);
    signOut({ callbackUrl: "/login" });
  };

  const openEditProfile = () => {
    setOpen(false);
    router.push("/profile/edit");
  };

  const openChangePassword = () => {
    setOpen(false);
    setShowChangePasswordModal(true);
  };

  const openDeleteAccount = () => {
    setOpen(false);
    setShowDeleteAccountModal(true);
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-expanded={open}
          aria-haspopup="true"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
              {(session?.user?.name ?? session?.user?.email ?? "U").charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        <ProfileBottomSheet open={open} onClose={() => setOpen(false)} />

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 hidden w-72 rounded-xl border border-slate-200 bg-white py-3 shadow-lg lg:block dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 pb-3 dark:border-slate-700">
              <div className="relative">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-lg font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                    {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  type="button"
                  className="absolute -right-1 -bottom-1 rounded-full bg-violet-500 p-1 text-white hover:bg-violet-600"
                  aria-label="Edit profile picture"
                >
                  <PencilIcon className="h-3 w-3" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                  {session?.user?.name ?? "User"}
                </p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <div className="py-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <CreditCardIcon className="h-5 w-5 text-slate-400" />
                Subscription
                <span className="ml-auto rounded bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  Launch
                </span>
              </button>
              <button
                type="button"
                onClick={openChangePassword}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <LockIcon className="h-5 w-5 text-slate-400" />
                Change Password
              </button>
              <button
                type="button"
                onClick={openEditProfile}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <PencilIcon className="h-5 w-5 text-slate-400" />
                Edit Profile
              </button>
              <button
                type="button"
                onClick={openDeleteAccount}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <TrashIcon className="h-5 w-5" />
                Delete Account
              </button>
              <button
                type="button"
                onClick={handleLogOut}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <LogOutIcon className="h-5 w-5 text-slate-400" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      <LogOutModal
        open={showLogOutModal}
        onClose={() => setShowLogOutModal(false)}
        onConfirm={confirmLogOut}
      />
      <ChangePasswordModal
        open={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
      <DeleteAccountModal
        open={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        requirePassword={session?.user?.provider === "credentials"}
      />
    </>
  );
}
