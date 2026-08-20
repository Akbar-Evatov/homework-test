"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "success";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white border border-zinc-900 dark:border-zinc-100 shadow-xs focus:ring-4 focus:ring-zinc-900/15 dark:focus:ring-zinc-100/20",
  secondary:
    "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-700",
  danger:
    "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white shadow-2xs focus:ring-4 focus:ring-rose-200 dark:focus:ring-rose-900",
  ghost:
    "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-700",
  outline:
    "border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:ring-4 focus:ring-zinc-200 dark:focus:ring-zinc-700",
  success:
    "bg-emerald-700 dark:bg-emerald-600 text-white shadow-xs hover:bg-emerald-800 dark:hover:bg-emerald-500 border border-emerald-600 focus:ring-4 focus:ring-emerald-500/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2.5",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed active:scale-[0.98] ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
