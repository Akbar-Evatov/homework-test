import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatsCard from "@/components/ui/StatsCard";
import NewClassForm from "./new-class-form";
import NewTestButton from "./new-test-button";
import {
  SchoolIcon,
  TestIcon,
  UsersIcon,
  TrophyIcon,
  ChevronRightIcon,
  EditIcon,
  ChartIcon,
} from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let classes: any[] = [];
  let tests: any[] = [];
  let dbError: string | null = null;

  try {
    const results = await Promise.all([
      prisma.class.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { students: true, assignments: true } } },
      }),
      prisma.test.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { assignments: true, attempts: true, questions: true } },
        },
      }),
    ]);
    classes = results[0];
    tests = results[1];
  } catch (err: any) {
    console.error("Dashboard database query failed:", err);
    dbError = err?.message || String(err);
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c._count?.students || 0), 0);
  const totalAttempts = tests.reduce((sum, item) => sum + (item._count?.attempts || 0), 0);

  const recentClasses = classes.slice(0, 6);
  const recentTests = tests.slice(0, 6);

  return (
    <div className="space-y-8 sm:space-y-10">
      {dbError && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-sm">
          <p className="font-semibold">Ma&apos;lumotlar bazasiga ulanishda xatolik yuz berdi:</p>
          <p className="text-xs opacity-90 mt-1 font-mono">{dbError}</p>
        </div>
      )}

      {/* 1. Overview Metrics */}
      <section className="space-y-3 sm:space-y-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("nav.dashboard")}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Sinflar, testlar va o&apos;quvchilar natijalarini real vaqtda boshqaring
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <Link href="/dashboard/classes" className="block group">
            <StatsCard
              title={t("dashboard.classesOverviewTitle")}
              value={classes.length}
              subtitle={`${totalStudents} nafar o'quvchi`}
              icon={<SchoolIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="indigo"
            />
          </Link>
          <Link href="/dashboard/tests" className="block group">
            <StatsCard
              title={t("dashboard.testsOverviewTitle")}
              value={tests.length}
              subtitle="Faol testlar"
              icon={<TestIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
              color="violet"
            />
          </Link>
          <StatsCard
            title="O'quvchilar"
            value={totalStudents}
            subtitle="Jami ro'yxatda"
            icon={<UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="sky"
          />
          <StatsCard
            title="Topshirishlar"
            value={totalAttempts}
            subtitle="Jami topshirilgan"
            icon={<TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            color="emerald"
          />
        </div>
      </section>

      {/* 2. Side-by-Side Sections (Horizontal split on Desktop, Vertical on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">
        {/* Subtle desktop vertical separation border between columns */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute inset-y-0 left-1/2 -ml-px w-px bg-zinc-200/90 dark:bg-zinc-800/90"
        />

        {/* LEFT COLUMN: Sinflar (Classes) */}
        <section className="space-y-4 lg:pr-4">
          {/* Header */}
          <div className="space-y-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shrink-0">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {t("dashboard.classesOverviewTitle")}
                    </h2>
                    <Badge variant="indigo">{classes.length}</Badge>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    Sinf jurnali va o&apos;quvchilar ro&apos;yxati
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/classes"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Barchasi ({classes.length})</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Class Creation */}
            <div className="pt-1">
              <NewClassForm />
            </div>
          </div>

          {/* Classes Cards List */}
          {classes.length === 0 ? (
            <Card className="p-8 text-center bg-white/60 dark:bg-zinc-900/60 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <SchoolIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm sm:text-base">
                {t("dashboard.noClasses")}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Yangi sinf yaratish uchun yuqoridagi maydonga nom kiriting.
              </p>
            </Card>
          ) : (
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {recentClasses.map((c) => (
                <li key={c.id}>
                  <Link href={`/dashboard/classes/${c.id}`} className="block group">
                    <Card
                      hover
                      className="p-4 flex flex-col justify-between h-full group-hover:border-indigo-300 dark:group-hover:border-indigo-700/80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                              {c.name}
                            </h3>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                              Sinf jurnali
                            </p>
                          </div>
                        </div>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-medium">
                          <UsersIcon className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                          <span>{c._count.students} {t("dashboard.studentCount")}</span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                          <TestIcon className="w-3 h-3 text-zinc-500 dark:text-zinc-400 shrink-0" />
                          <span>{c._count.assignments} test</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* RIGHT COLUMN: Testlar (Tests) */}
        <section className="space-y-4 lg:pl-4">
          {/* Header */}
          <div className="space-y-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/80 dark:border-violet-800/60 shrink-0">
                  <TestIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {t("dashboard.testsOverviewTitle")}
                    </h2>
                    <Badge variant="violet">{tests.length}</Badge>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    Savollar, havolalar va natijalar
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/tests"
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Barchasi ({tests.length})</span>
                <ChevronRightIcon className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Test Creation */}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                Yangi test tayyorlash:
              </span>
              <NewTestButton />
            </div>
          </div>

          {/* Tests Cards List */}
          {tests.length === 0 ? (
            <Card className="p-8 text-center bg-white/60 dark:bg-zinc-900/60 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
                <TestIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm sm:text-base">
                {t("dashboard.noTests")}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                Hozircha testlar yo&apos;q. &quot;Yangi test&quot; tugmasini bosing.
              </p>
            </Card>
          ) : (
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {recentTests.map((test) => (
                <li key={test.id}>
                  <Card
                    hover
                    className="p-4 flex flex-col justify-between h-full group group-hover:border-violet-300 dark:group-hover:border-violet-700/80"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                          {test.title}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <Badge variant="slate" icon={<SchoolIcon className="w-2.5 h-2.5" />}>
                          {test._count.assignments} sinf
                        </Badge>
                        <Badge variant="emerald" icon={<TrophyIcon className="w-2.5 h-2.5" />}>
                          {test._count.attempts} natija
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-1">
                      <Link
                        href={`/dashboard/tests/${test.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white py-1 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <EditIcon className="w-3 h-3" />
                        <span>{t("dashboard.viewTest")}</span>
                      </Link>

                      <Link
                        href={`/dashboard/tests/${test.id}/results`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-200 py-1 px-2 rounded-md bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100/80 dark:hover:bg-violet-900/60 border border-violet-200/80 dark:border-violet-800/60 transition-colors"
                      >
                        <ChartIcon className="w-3 h-3" />
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
    </div>
  );
}
