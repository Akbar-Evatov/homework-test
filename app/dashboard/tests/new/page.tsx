import Link from "next/link";
import { t } from "@/lib/i18n";
import TestEditor from "../test-editor";

export default function NewTestPage() {
  return (
    <div className="space-y-4">
      <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
        ← {t("common.back")}
      </Link>
      <h1 className="text-xl font-semibold text-slate-900">{t("tests.newTestTitle")}</h1>
      <TestEditor />
    </div>
  );
}
