"use client";

import { useState, useRef, useEffect } from "react";
import { PaperclipIcon, MicIcon, SendIcon } from "@/components/icons";

export function ChatInput({
  onSend,
  disabled,
  placeholder = "Ask me Anything",
}: {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4"
    >
      <div className="flex items-center justify-center my-4">
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800" style={{ width: 'calc(100% - 60px)'}}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={placeholder}
            rows={1}
            disabled={disabled}
            className="min-h-[48px] flex-1 resize-none rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 disabled:opacity-50 dark:text-slate-100"
          />
          <div className="flex items-center gap-1 py-3 pr-2">
            <button
              type="button"
              className="rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
              aria-label="Attach file"
            >
              <PaperclipIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
              aria-label="Voice input"
            >
              <MicIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="rounded-full mx-2 p-2.5 text-white cursor-pointer"
          style={{ backgroundColor: '#006C67' }}
          aria-label="Send"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
