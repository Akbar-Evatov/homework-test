import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatsCard from "@/components/ui/StatsCard";
import AddStudentForm from "./add-student-form";
import DeleteClassButton from "./delete-class-button";
import DownloadClassExcelButton from "./download-excel-button";
import {
  ArrowLeftIcon,
  UsersIcon,
  TestIcon,
  TrophyIcon,
  PlusIcon,
} from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: { orderBy: { id: "asc" } },
      assignments: {
        include: {
          test: {
            select: {
              id: true,
              title: true,
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
  });

  if (!cls) notFound();

  const totalAssignedTests = cls.assignments.length;
  const studentIds = cls.students.map((s) => s.id);

  const assignedTests = cls.assignments.map((a) => ({
    id: a.test.id,
    title: a.test.title,
    totalQuestions: a.test._count.questions,
  }));

  const attempts = studentIds.length
    ? await prisma.attempt.findMany({
        where: { studentId: { in: studentIds } },
        select: { studentId: true, testId: true, score: true, totalQuestions: true },
      })
    : [];

  const attemptsByStudent = new Map<
    number,
    { testId: string; score: number; totalQuestions: number }[]
  >();
  for (const a of attempts) {
    const list = attemptsByStudent.get(a.studentId) ?? [];
    list.push({ testId: a.testId, score: a.score, totalQuestions: a.totalQuestions });
    attemptsByStudent.set(a.studentId, list);
  }

  const students = cls.students.map((s) => {
    const studentAttempts = attemptsByStudent.get(s.id) ?? [];
    const testsTaken = studentAttempts.length;
    const testsPending = Math.max(totalAssignedTests - testsTaken, 0);
    const averageScore =
      testsTaken > 0
        ? Math.round(
            (studentAttempts.reduce(
              (sum, a) => sum + (a.totalQuestions > 0 ? a.score / a.totalQuestions : 0),
              0
            ) /
              testsTaken) *
              100
          )
        : null;
    const testScores: Record<string, { score: number; totalQuestions: number }> = {};
    for (const a of studentAttempts) {
      testScores[a.testId] = { score: a.score, totalQuestions: a.totalQuestions };
    }

    return { ...s, testsTaken, testsPending, averageScore, testScores };
  });

  const studentsWithScores = students.filter((s) => s.averageScore !== null);
  const classAvgScore =
    studentsWithScores.length > 0
      ? Math.round(
          studentsWithScores.reduce((acc, s) => acc + (s.averageScore ?? 0), 0) /
            studentsWithScores.length
        )
      : null;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <Link
            href="/dashboard/classes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t("common.back")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-base sm:text-lg flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              {cls.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {cls.name}
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                Sinf jurnali va o&apos;quvchilar ko&apos;rsatkichlari
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <DownloadClassExcelButton
            className={cls.name}
            students={students}
            assignedTests={assignedTests}
          />
          <DeleteClassButton classId={cls.id} />
        </div>
      </div>

      {/* 2. Quick Class Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatsCard
          title={t("classes.rosterTitle")}
          value={students.length}
          subtitle="Jami o'quvchilar"
          icon={<UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="indigo"
        />
        <StatsCard
          title="Biriktirilgan testlar"
          value={totalAssignedTests}
          subtitle="Ushbu sinf uchun"
          icon={<TestIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="violet"
        />
        <StatsCard
          title="Sinf o'rtacha bali"
          value={classAvgScore === null ? "—" : `${classAvgScore}%`}
          subtitle="Umumiy o'zlashtirish"
          icon={<TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="emerald"
        />
      </div>

      {/* 3. Add Student Form */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">
            <PlusIcon className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
            {t("classes.addStudentTitle")}
          </h2>
        </div>
        <AddStudentForm classId={cls.id} />
      </Card>

      {/* 4. Roster Table */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500 dark:text-indigo-400" />
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
              {t("classes.rosterTitle")}
            </h2>
            <Badge variant="indigo">{students.length}</Badge>
          </div>
          <DownloadClassExcelButton
            className={cls.name}
            students={students}
            assignedTests={assignedTests}
          />
        </div>

        {students.length === 0 ? (
          <Card className="p-8 text-center bg-white/60 dark:bg-zinc-900/60 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-base">
              {t("classes.noStudents")}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Yuqoridagi maydonga o&apos;quvchining ismini kiritib, ro&apos;yxatga qo&apos;shing.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-zinc-200/90 dark:border-zinc-800/90">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left min-w-[500px]">
                <thead className="border-b border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-50/80 dark:bg-zinc-850/80 text-[10px] sm:text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5">{t("classes.studentCode")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5">{t("classes.studentName")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5 text-center">{t("classes.testsTaken")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5 text-center">{t("classes.testsPending")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5 text-right">{t("classes.averageScore")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {students.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 transition-colors"
                    >
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-mono">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 tracking-wider">
                          {s.studentCode}
                        </span>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-200/80 dark:border-indigo-800/60">
                            {s.name.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="truncate max-w-[150px] sm:max-w-none">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-center font-medium text-zinc-700 dark:text-zinc-300 font-mono">
                        {s.testsTaken}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-center">
                        {s.testsPending > 0 ? (
                          <Badge variant="amber">{s.testsPending}</Badge>
                        ) : (
                          <Badge variant="emerald">0</Badge>
                        )}
                      </td>
                      <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-right font-mono">
                        {s.averageScore === null ? (
                          <span className="text-zinc-400 dark:text-zinc-500 font-medium">—</span>
                        ) : (
                          <Badge
                            variant={
                              s.averageScore >= 80
                                ? "emerald"
                                : s.averageScore >= 60
                                ? "indigo"
                                : s.averageScore >= 40
                                ? "amber"
                                : "rose"
                            }
                            className="font-bold text-xs"
                          >
                            {s.averageScore}%
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}
