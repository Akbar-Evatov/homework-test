import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import NewClassForm from "../new-class-form";
import {
  SchoolIcon,
  UsersIcon,
  TestIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { students: true, assignments: true } } },
  });

  const totalStudents = classes.reduce((sum, c) => sum + c._count.students, 0);

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
            <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs shrink-0">
              <SchoolIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {t("dashboard.classesOverviewTitle")}
                </h1>
                <Badge variant="indigo">{classes.length} sinf</Badge>
                <Badge variant="sky">{totalStudents} o&apos;quvchi</Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Sinflar jurnali, o&apos;quvchilar ro&apos;yxati va test biriktirish
              </p>
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <NewClassForm />
        </div>
      </div>

      {/* 2. Classes Grid */}
      <section>
        {classes.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-white/60 dark:bg-zinc-900/60 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 border border-indigo-100 dark:border-indigo-900">
              <SchoolIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-base sm:text-lg">
              {t("dashboard.noClasses")}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Yuqoridagi maydonga yangi sinf nomini kiriting va &quot;Yaratish&quot; tugmasini bosing.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((c) => (
              <li key={c.id}>
                <Link href={`/dashboard/classes/${c.id}`} className="block group">
                  <Card
                    hover
                    className="p-4 sm:p-5 flex flex-col justify-between h-full group-hover:border-indigo-300 dark:group-hover:border-indigo-700/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm sm:text-base flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {c.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500">
                            Sinf jurnali
                          </p>
                        </div>
                      </div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-100 dark:bg-zinc-850 text-zinc-400 dark:text-zinc-500 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                        <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                        <UsersIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span>{c._count.students} {t("dashboard.studentCount")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <TestIcon className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                        <span>{c._count.assignments} {t("dashboard.testsAssigned")}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
