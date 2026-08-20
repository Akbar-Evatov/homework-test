import { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "indigo" | "violet" | "emerald" | "amber" | "rose" | "sky" | "zinc" | "slate";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  indigo:
    "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60",
  violet:
    "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/60",
  emerald:
    "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60",
  amber:
    "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60",
  rose:
    "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60",
  sky:
    "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200/80 dark:border-sky-800/60",
  zinc:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700",
  slate:
    "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700",
};

const dotColors: Record<BadgeVariant, string> = {
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  sky: "bg-sky-500",
  zinc: "bg-zinc-500",
  slate: "bg-zinc-500",
};

export default function Badge({
  variant = "zinc",
  icon,
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border shadow-2xs transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
