import Link from "next/link";
import { t } from "@/lib/i18n";
import LogoutButton from "./logout-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-slate-900">
            {t("common.appName")}
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-700 hover:underline">
              {t("nav.dashboard")}
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
