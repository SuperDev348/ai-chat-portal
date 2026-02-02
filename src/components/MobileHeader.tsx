"use client";

import Link from "next/link";
import { WsLogo } from "./WsLogo";

export function MobileHeader({
  onMenuClick,
  showMenu = true,
}: {
  onMenuClick?: () => void;
  showMenu?: boolean;
}) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700 dark:bg-slate-900">
      <Link href="/" className="flex items-center gap-2">
        <WsLogo size="sm" />
        <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          warpSpeed
        </span>
      </Link>
      {showMenu && (
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </header>
  );
}
