import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export default function Card({ className = "", hover = false, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-md shadow-xs dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] ring-1 ring-zinc-950/5 dark:ring-zinc-800/40 transition-all duration-200 ${
        hover
          ? "hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.6)] hover:border-zinc-400 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-900"
          : ""
      } ${className}`}
    />
  );
}
