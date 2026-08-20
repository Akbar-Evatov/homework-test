import Link from "next/link";
import { t } from "@/lib/i18n";
import LogoutButton from "./logout-button";
import NavLinks from "./nav-links";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LogoIcon, SparklesIcon } from "@/components/ui/Icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl shadow-2xs transition-colors duration-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 sm:gap-3 group transition-transform active:scale-98 shrink-0"
          >
            <div className="p-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-2xs transition-all">
              <LogoIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tracking-tight text-sm sm:text-lg block leading-tight">
                {t("common.appName")}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 hidden md:flex items-center gap-1">
                <SparklesIcon className="w-2.5 h-2.5" /> O&apos;qituvchi platformasi
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <NavLinks />
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
            <ThemeToggle />
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 sm:px-6 py-5 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-zinc-200/70 dark:border-zinc-800/70 bg-white/40 dark:bg-zinc-950/40 backdrop-blur-sm mt-auto transition-colors duration-200">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500" />
            <span>{t("common.appName")} — Onlayn test va tahlil tizimi</span>
          </div>
          <p>&copy; {new Date().getFullYear()} Barcha huquqlar himoyalangan</p>
        </div>
      </footer>
    </div>
  );
}
