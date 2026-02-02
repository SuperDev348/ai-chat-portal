"use client";

import { useState, useRef, useEffect } from "react";
import { PaperclipIcon, MicIcon, SendIcon } from "@/components/icons";

const ACCEPT_FILES = "image/*,.pdf,.doc,.docx,.txt,*/*";
const MAX_ATTACH_FILES = 4;
const MAX_FILE_SIZE_MB = 10;

export function ChatInput({
  onSend,
  onSendWithAttachments,
  onSendAudio,
  disabled,
  placeholder = "Ask me Anything",
}: {
  onSend: (content: string) => void;
  onSendWithAttachments?: (content: string, files: File[]) => void;
  onSendAudio?: (audioBlob: Blob) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const trimmed = value.trim();
    if (attachments.length > 0 && onSendWithAttachments) {
      onSendWithAttachments(trimmed || " ", attachments);
      setValue("");
      setAttachments([]);
      return;
    }
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    const total = attachments.length + files.length;
    if (total > MAX_ATTACH_FILES) return;
    const sized = files.filter((f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    setAttachments((prev) => [...prev, ...sized].slice(0, MAX_ATTACH_FILES));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    if (!onSendAudio) return;
    setRecordError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          onSendAudio(blob);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setRecordError(err instanceof Error ? err.message : "Microphone access denied");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleRecord = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  const canSend = value.trim() || attachments.length > 0;

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative inline-block rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <span className="inline-block p-2 text-xs text-slate-600 dark:text-slate-400">
                  {file.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-white hover:bg-slate-700"
                aria-label="Remove attachment"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      {recordError && (
        <p className="mb-2 text-sm text-amber-600 dark:text-amber-400">{recordError}</p>
      )}
      <div className="flex items-center justify-center my-4">
        <div
          className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
          style={{ width: "calc(100% - 60px)" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_FILES}
            multiple
            className="hidden"
            onChange={onFileChange}
          />
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
            disabled={disabled || isRecording}
            className="min-h-[48px] flex-1 resize-none rounded-xl border-0 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-0 disabled:opacity-50 dark:text-slate-100"
          />
          <div className="flex items-center gap-1 py-3 pr-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isRecording || (onSendWithAttachments ? false : true)}
              className="rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-600 dark:hover:text-slate-300"
              aria-label="Attach file"
            >
              <PaperclipIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleRecord}
              disabled={disabled}
              className={`rounded-lg ${
                isRecording
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : "text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-600 dark:hover:text-slate-300"
              }`}
              aria-label={isRecording ? "Stop recording" : "Voice input"}
            >
              <MicIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!canSend || disabled || isRecording}
          className="rounded-full mx-2 p-2.5 text-white cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: "#006C67" }}
          aria-label="Send"
        >
          <SendIcon className="h-5 w-5" />
        </button>
      </div>
      {isRecording && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Recording… Click the mic again to send.
        </p>
      )}
    </form>
  );
}
