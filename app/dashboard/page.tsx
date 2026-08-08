import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import NewClassForm from "./new-class-form";
import NewTestButton from "./new-test-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [classes, tests] = await Promise.all([
    prisma.class.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { students: true, assignments: true } } },
    }),
    prisma.test.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { assignments: true, attempts: true } } },
    }),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">
            {t("dashboard.classesOverviewTitle")}
          </h1>
        </div>
        <NewClassForm />
        {classes.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("dashboard.noClasses")}</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {classes.map((c) => (
              <li key={c.id}>
                <Link href={`/dashboard/classes/${c.id}`}>
                  <Card className="p-4 hover:border-indigo-400">
                    <p className="font-medium text-slate-900">{c.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {c._count.students} {t("dashboard.studentCount")} ·{" "}
                      {c._count.assignments} {t("dashboard.testsAssigned")}
                    </p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">
            {t("dashboard.testsOverviewTitle")}
          </h1>
          <NewTestButton />
        </div>
        {tests.length === 0 ? (
          <p className="text-sm text-slate-500">{t("dashboard.noTests")}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {tests.map((test) => (
              <li key={test.id}>
                <Card className="p-4">
                  <p className="font-medium text-slate-900">{test.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {test._count.assignments} {t("dashboard.testsAssigned")} ·{" "}
                    {test._count.attempts} {t("results.title").toLowerCase()}
                  </p>
                  <div className="mt-3 flex gap-4 text-sm">
                    <Link
                      href={`/dashboard/tests/${test.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {t("dashboard.viewTest")}
                    </Link>
                    <Link
                      href={`/dashboard/tests/${test.id}/results`}
                      className="text-indigo-600 hover:underline"
                    >
                      {t("dashboard.viewResults")}
                    </Link>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
