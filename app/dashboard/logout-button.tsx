"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { LogoutIcon } from "@/components/ui/Icons";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-50"
      title={t("nav.logout")}
    >
      <LogoutIcon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{t("nav.logout")}</span>
    </button>
  );
}
