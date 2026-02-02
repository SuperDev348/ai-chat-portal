"use client";

export function WsLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-9 w-9 text-sm" : "h-14 w-14 text-base";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-teal-500 font-bold uppercase tracking-tight text-white ${sizeClass} ${className ?? ""}`}
      aria-hidden
    >
      ws
    </div>
  );
}
