import Link from "next/link";
import { t } from "@/lib/i18n";
import { PlusIcon } from "@/components/ui/Icons";

export default function NewTestButton() {
  return (
    <Link
      href="/dashboard/tests/new"
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white border border-zinc-900 dark:border-zinc-100 shadow-xs transition-all duration-150 active:scale-98"
    >
      <PlusIcon className="w-4 h-4" />
      <span>{t("dashboard.createTestButton")}</span>
    </Link>
  );
}
