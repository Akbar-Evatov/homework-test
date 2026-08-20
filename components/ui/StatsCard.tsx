import { ReactNode } from "react";
import Card from "./Card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: "indigo" | "violet" | "emerald" | "sky" | "amber" | "zinc";
}

const colorStyles = {
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800/60",
    glow: "from-indigo-500/5 dark:from-indigo-500/10 to-transparent",
  },
  violet: {
    bg: "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-200/80 dark:border-violet-800/60",
    glow: "from-violet-500/5 dark:from-violet-500/10 to-transparent",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/60",
    glow: "from-emerald-500/5 dark:from-emerald-500/10 to-transparent",
  },
  sky: {
    bg: "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/60",
    glow: "from-sky-500/5 dark:from-sky-500/10 to-transparent",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-800/60",
    glow: "from-amber-500/5 dark:from-amber-500/10 to-transparent",
  },
  zinc: {
    bg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700",
    glow: "from-zinc-500/5 to-transparent",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "zinc",
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <Card
      hover
      className={`p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br ${styles.glow} bg-white/90 dark:bg-zinc-900/80`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 font-mono">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center border shadow-2xs shrink-0 ${styles.bg}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
