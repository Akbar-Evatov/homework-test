import Link from "next/link";
import { t } from "@/lib/i18n";

export default function NewTestButton() {
  return (
    <Link
      href="/dashboard/tests/new"
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    >
      {t("dashboard.createTestButton")}
    </Link>
  );
}
