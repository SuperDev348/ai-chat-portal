"use client";

import { useSession } from "next-auth/react";
import { DownloadIcon, SpeakerIcon, ThumbUpIcon, ThumbDownIcon } from "@/components/icons";

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export function MessageList({ messages }: { messages: Message[] }) {
  const { data: session } = useSession();

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      {messages.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Hello there !
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            I&apos;m your AI chat assistant. Ask me anything to begin!
          </p>
        </div>
      )}
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
        >
          {m.role === "user" ? (
            <>
              <div className="max-w-[75%] rounded-2xl rounded-tr-md bg-slate-200 px-4 py-2.5 dark:bg-slate-600">
                <p className="whitespace-pre-wrap break-words text-sm text-slate-800 dark:text-slate-100">
                  {m.content}
                </p>
              </div>
              <div className="shrink-0">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-sm font-medium text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                    {(session?.user?.name ?? "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </>
          ) : m.role === "assistant" ? (
            <>
              <div className="shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-600">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">AI</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="inline-block max-w-[85%] rounded-2xl rounded-tl-md bg-slate-100 px-4 py-2.5 dark:bg-slate-700">
                  <p className="whitespace-pre-wrap break-words text-sm text-slate-800 dark:text-slate-200">
                    {m.content}
                  </p>
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                    aria-label="Copy"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                    aria-label="Download"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                    aria-label="Read aloud"
                  >
                    <SpeakerIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                    aria-label="Good response"
                  >
                    <ThumbUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
                    aria-label="Bad response"
                  >
                    <ThumbDownIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full">
              <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs italic text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {m.content}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
