"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function DeleteClassButton({ classId }: { classId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setPending(true);
    try {
      const res = await fetch(`/api/classes/${classId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span>{t("classes.deleteClassConfirm")}</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {t("common.yes")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-slate-600 hover:underline disabled:opacity-50"
        >
          {t("common.no")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm text-red-600 hover:underline"
    >
      {t("classes.deleteClassButton")}
    </button>
  );
}
