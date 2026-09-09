"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import { TrashIcon, AlertCircleIcon } from "@/components/ui/Icons";

export default function DeleteTestButton({ testId }: { testId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const res = await fetch(`/api/tests/${testId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/tests");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-1.5 font-medium">
          <AlertCircleIcon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{t("tests.deleteTestConfirm")}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            size="sm"
            variant="danger"
            onClick={handleDelete}
            loading={pending}
            className="px-2.5 py-1 text-xs"
          >
            {t("common.yes")}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="px-2.5 py-1 text-xs"
          >
            {t("common.no")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => setConfirming(true)}
      icon={<TrashIcon className="w-3.5 h-3.5" />}
      className="text-xs"
    >
      {t("tests.deleteTestButton")}
    </Button>
  );
}
