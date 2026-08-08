"use client";

import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-slate-600 hover:underline">
      {t("nav.logout")}
    </button>
  );
}
