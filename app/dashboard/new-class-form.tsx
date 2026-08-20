"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { PlusIcon, SchoolIcon, AlertCircleIcon } from "@/components/ui/Icons";

export default function NewClassForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        setError(t("common.error"));
        return;
      }

      setName("");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2 w-full sm:w-auto">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full max-w-md"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <SchoolIcon className="w-4 h-4" />
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("classes.classNamePlaceholder")}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-900"
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={pending}
          disabled={!name.trim()}
          icon={<PlusIcon className="w-4 h-4" />}
          className="shrink-0 text-sm font-semibold w-full sm:w-auto"
        >
          {t("classes.createButton")}
        </Button>
      </form>
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
          <AlertCircleIcon className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
