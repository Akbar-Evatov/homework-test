import Link from "next/link";
import { t } from "@/lib/i18n";
import TestEditor from "../test-editor";
import { ArrowLeftIcon, TestIcon } from "@/components/ui/Icons";

export default function NewTestPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <Link
          href="/dashboard/tests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mb-2"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>{t("common.back")}</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/80 dark:border-violet-800/60 shadow-2xs">
            <TestIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {t("tests.newTestTitle")}
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Savollar, rasmlar va to&apos;g&apos;ri javoblarni kiriting
            </p>
          </div>
        </div>
      </div>

      <TestEditor />
    </div>
  );
}
