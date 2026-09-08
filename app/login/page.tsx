"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LogoIcon, LockIcon, AlertCircleIcon } from "@/components/ui/Icons";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || t("login.invalidPassword"));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 min-h-[calc(100vh-4rem)] relative">
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative">
        <Card className="p-8 sm:p-10 shadow-xl border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-2.5 mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm">
              <LogoIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t("login.title")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("common.appName")} — O&apos;qituvchi boshqaruv paneli
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
              >
                <span>{t("login.passwordLabel")}</span>
                <LockIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="w-full px-4 py-2.5 text-base text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500/15"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-sm">
                <AlertCircleIcon className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={pending}
              className="w-full py-3 text-base font-semibold shadow-md"
            >
              {t("login.submitButton")}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-200/70 dark:border-zinc-800/70 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Matematika testlari &copy; {new Date().getFullYear()}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
