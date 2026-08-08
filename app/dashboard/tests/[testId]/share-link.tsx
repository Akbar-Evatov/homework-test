"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import Button from "@/components/ui/Button";

export default function ShareLink({ testId }: { testId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/test/${testId}` : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
      />
      <Button type="button" variant="primary" onClick={handleCopy} className="px-4 py-2 text-sm">
        {copied ? t("common.copied") : t("tests.copyLinkButton")}
      </Button>
    </div>
  );
}
