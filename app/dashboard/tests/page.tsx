import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import NewTestButton from "../new-test-button";
import {
  TestIcon,
  SchoolIcon,
  TrophyIcon,
  EditIcon,
  ChartIcon,
  ArrowLeftIcon,
} from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { assignments: true, attempts: true, questions: true } },
    },
  });

  const totalAttempts = tests.reduce((sum, item) => sum + item._count.attempts, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t("common.back")}</span>
          </Link>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/80 dark:border-violet-800/60 shadow-2xs shrink-0">
              <TestIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t("dashboard.testsOverviewTitle")}
                </h1>
                <Badge variant="violet">{tests.length} ta test</Badge>
                <Badge variant="emerald">{totalAttempts} ta topshirish</Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Savollarni tahrirlang, havolalarni ulashing va natijalarni real vaqtda ko&apos;ring
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <NewTestButton />
        </div>
      </div>

      {/* 2. Tests Grid */}
      <section>
        {tests.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-white/60 dark:bg-zinc-900/60 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3 border border-violet-100 dark:border-violet-900">
              <TestIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base sm:text-lg">
              {t("dashboard.noTests")}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Hozircha testlar yaratilmagan. Yangi test yaratish uchun &quot;Yangi test&quot; tugmasini bosing.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <li key={test.id}>
                <Card
                  hover
                  className="p-4 sm:p-5 flex flex-col justify-between h-full group group-hover:border-violet-300 dark:group-hover:border-violet-700/80"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {test.title}
                      </h3>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="slate" icon={<SchoolIcon className="w-3 h-3" />}>
                        {test._count.assignments} sinfga biriktirilgan
                      </Badge>
                      <Badge variant="emerald" icon={<TrophyIcon className="w-3 h-3" />}>
                        {test._count.attempts} {t("results.title").toLowerCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <Link
                      href={`/dashboard/tests/${test.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1.5 px-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                      <span>{t("dashboard.viewTest")}</span>
                    </Link>

                    <Link
                      href={`/dashboard/tests/${test.id}/results`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 py-1.5 px-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100/80 dark:hover:bg-violet-900/60 border border-violet-200/80 dark:border-violet-800/60 transition-colors"
                    >
                      <ChartIcon className="w-3.5 h-3.5" />
                      <span>{t("dashboard.viewResults")}</span>
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
