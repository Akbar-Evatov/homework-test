"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { CheckIcon, SchoolIcon, CheckCircleIcon } from "@/components/ui/Icons";

export default function AssignClasses({
  testId,
  allClasses,
  assignedClassIds,
}: {
  testId: string;
  allClasses: { id: string; name: string }[];
  assignedClassIds: string[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(assignedClassIds));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggle(classId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  }

  async function handleSave() {
    setPending(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/tests/${testId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classIds: Array.from(selected) }),
      });
      if (res.ok) {
        setMessage(t("tests.savedMessage"));
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (allClasses.length === 0) {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
        {t("dashboard.noClasses")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {allClasses.map((c) => {
          const isChecked = selected.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer select-none ${
                isChecked
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                  isChecked
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 border-transparent"
                    : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800"
                }`}
              >
                {isChecked && <CheckIcon className="w-3 h-3" />}
              </div>
              <SchoolIcon className="w-4 h-4 opacity-70" />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          loading={pending}
          className="px-5 py-2 text-sm font-semibold"
        >
          {t("common.save")}
        </Button>
        {message && (
          <div className="inline-flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-semibold bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
