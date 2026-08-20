"use client";

import { TextareaHTMLAttributes } from "react";

export default function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-900 dark:focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 shadow-2xs transition-all duration-200 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:cursor-not-allowed ${className}`}
      {...props}
    />
  );
}
