"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { PlusIcon, UsersIcon, CheckCircleIcon, CopyIcon, CheckIcon, AlertCircleIcon } from "@/components/ui/Icons";

export default function AddStudentForm({ classId }: { classId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/api/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        setError(t("common.error"));
        return;
      }

      const data = await res.json();
      setLastAdded(data.student.studentCode);
      setName("");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setPending(false);
    }
  }

  async function copyCode() {
    if (!lastAdded) return;
    await navigator.clipboard.writeText(lastAdded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-lg">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <UsersIcon className="w-4 h-4" />
          </div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("classes.studentNamePlaceholder")}
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
          className="shrink-0 text-sm font-semibold"
        >
          {t("classes.addStudentButton")}
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
          <AlertCircleIcon className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}

      {lastAdded && (
        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-medium animate-fade-in">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {t("classes.studentCode")}:{" "}
            <span className="font-mono font-bold bg-white dark:bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm tracking-wider">
              {lastAdded}
            </span>
          </span>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors text-[11px] font-semibold cursor-pointer ml-1"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3 h-3" />
                <span>Nusxalandi</span>
              </>
            ) : (
              <>
                <CopyIcon className="w-3 h-3" />
                <span>Nusxa olish</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
