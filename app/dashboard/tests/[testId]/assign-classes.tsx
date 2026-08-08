"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Button from "@/components/ui/Button";

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
    return <p className="text-sm text-slate-500">{t("dashboard.noClasses")}</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {allClasses.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
          >
            <input
              type="checkbox"
              checked={selected.has(c.id)}
              onChange={() => toggle(c.id)}
              className="accent-indigo-600"
            />
            {c.name}
          </label>
        ))}
      </div>
      <Button type="button" variant="primary" onClick={handleSave} disabled={pending} className="px-4 py-2 text-sm">
        {t("common.save")}
      </Button>
      {message && <p className="text-sm text-emerald-600">{message}</p>}
    </div>
  );
}
