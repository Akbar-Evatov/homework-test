"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CopyIcon, CheckIcon, EyeIcon } from "@/components/ui/Icons";

export default function ShareLink({ testId }: { testId: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/test/${testId}` : "";

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Input
            readOnly
            value={url}
            onFocus={(e) => e.target.select()}
            className="w-full px-3.5 py-2 font-mono text-xs sm:text-sm bg-zinc-50/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={handleCopy}
            icon={copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
            className="px-4 py-2 text-sm font-semibold shrink-0"
          >
            {copied ? t("common.copied") : t("tests.copyLinkButton")}
          </Button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-2xs"
            title="Havolani ochish"
          >
            <EyeIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Ushbu havolani o&apos;quvchilarga yuboring. Ular o&apos;zlarining ID raqami orqali testni boshlaydilar.
      </p>
    </div>
  );
}
