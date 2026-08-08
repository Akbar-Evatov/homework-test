"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

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
        setError(t("login.invalidPassword"));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8 shadow-sm">
        <h1 className="mb-6 text-center text-xl font-semibold text-slate-900">
          {t("login.title")}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              {t("login.passwordLabel")}
            </label>
            <Input
              id="password"
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPlaceholder")}
              className="w-full px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" disabled={pending} className="w-full px-4 py-2">
            {t("login.submitButton")}
          </Button>
        </form>
      </Card>
    </div>
  );
}
