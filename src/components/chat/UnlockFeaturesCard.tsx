"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "warpspeed-unlock-card-dismissed";

export function UnlockFeaturesCard() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch {}
  }, []);

  const handleGetApp = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div className="mx-3 mb-4 flex flex-col gap-3 rounded-2xl border border-violet-200 bg-violet-50 py-8 px-12 dark:border-violet-800 dark:bg-violet-900/20 sm:mx-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 sm:text-base">
          <span className="sm:hidden">Unlock the full power of warpSpeed.</span>
          <span className="hidden sm:inline">Unlock Exclusive Features in the App</span>
        </h3>
        <p className="mt-0.5 hidden text-xs text-slate-600 dark:text-slate-400 sm:block">
          Access offline chat, private notes, and personalized insights — only in our mobile app.
        </p>
      </div>
      <button
        type="button"
        onClick={handleGetApp}
        className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 cursor-pointer"
        style={{ backgroundColor: '#006C67', borderRadius: '50px' }}
      >
        Get the App
      </button>
    </div>
  );
}
