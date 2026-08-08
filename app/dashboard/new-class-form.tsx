"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        setError(t("common.error"));
        return;
      }

      setName("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("classes.classNamePlaceholder")}
        className="flex-1 max-w-xs px-3 py-2 text-sm"
      />
      <Button type="submit" variant="primary" disabled={pending || !name.trim()} className="px-4 py-2 text-sm">
        {t("classes.createButton")}
      </Button>
      {error && <p className="self-center text-sm text-red-600">{error}</p>}
    </form>
  );
}
