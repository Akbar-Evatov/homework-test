import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StatsCard from "@/components/ui/StatsCard";
import {
  ArrowLeftIcon,
  TrophyIcon,
  ChartIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  EditIcon,
} from "@/components/ui/Icons";

export const dynamic = "force-dynamic";

export default async function TestResultsPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { choices: true },
      },
    },
  });

  if (!test) notFound();

  const attempts = await prisma.attempt.findMany({
    where: { testId },
    orderBy: { submittedAt: "desc" },
    include: { student: { select: { name: true, studentCode: true } } },
  });

  const totalAttempts = attempts.length;

  const averageScorePercent =
    totalAttempts > 0
      ? Math.round(
          (attempts.reduce(
            (sum, a) => sum + (a.totalQuestions > 0 ? a.score / a.totalQuestions : 0),
            0
          ) /
            totalAttempts) *
            100
        )
      : null;

  const maxScore =
    totalAttempts > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

  const breakdown = test.questions.map((q) => {
    const correctChoiceId = q.choices.find((c) => c.isCorrect)?.id;
    const correctCount = attempts.filter((a) => {
      const answers = a.answers as Record<string, string>;
      return answers[q.id] === correctChoiceId;
    }).length;
    const percent = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    return { id: q.id, text: q.text, percent, correctCount };
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <Link
            href="/dashboard/tests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            <span>{t("common.back")}</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200/80 dark:border-violet-800/60 shadow-2xs shrink-0">
              <ChartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {t("results.title")}: {test.title}
              </h1>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                O&apos;quvchilarning natijalari va savollar bo&apos;yicha chuqur tahlil
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/tests/${test.id}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-all shadow-2xs w-full sm:w-auto"
        >
          <EditIcon className="w-4 h-4 text-zinc-500" />
          <span>{t("dashboard.viewTest")}</span>
        </Link>
      </div>

      {/* 2. Results Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatsCard
          title="Topshirishlar soni"
          value={totalAttempts}
          subtitle="Jami topshirganlar"
          icon={<UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="indigo"
        />
        <StatsCard
          title="O'rtacha natija"
          value={averageScorePercent === null ? "—" : `${averageScorePercent}%`}
          subtitle="Umumiy muvaffaqiyat"
          icon={<ChartIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="violet"
        />
        <StatsCard
          title="Eng yuqori ball"
          value={maxScore === null ? "—" : `${maxScore} / ${test.questions.length}`}
          subtitle="Maksimal natija"
          icon={<TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="emerald"
        />
      </div>

      {/* 3. Submissions Table */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
              Topshirilgan ishlar
            </h2>
            <Badge variant="indigo">{attempts.length}</Badge>
          </div>
        </div>

        {attempts.length === 0 ? (
          <Card className="p-8 text-center bg-white/60 dark:bg-zinc-900/60 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <UsersIcon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 text-base">
              {t("results.noAttempts")}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              O&apos;quvchilar test havolasi orqali testni topshirgach, natijalar shu yerda ko&apos;rinadi.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden border-zinc-200/90 dark:border-zinc-800/90">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left min-w-[500px]">
                <thead className="border-b border-zinc-200/90 dark:border-zinc-800/90 bg-zinc-50/80 dark:bg-zinc-850/80 text-[10px] sm:text-xs uppercase font-semibold text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5">{t("results.idColumn")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5">{t("results.studentColumn")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5 text-center">{t("results.scoreColumn")}</th>
                    <th className="px-3 sm:px-5 py-3 sm:py-3.5 text-right">{t("results.submittedAtColumn")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {attempts.map((a) => {
                    const percent =
                      a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0;
                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-violet-50/20 dark:hover:bg-violet-950/20 transition-colors"
                      >
                        <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-mono">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs border border-zinc-200 dark:border-zinc-700 tracking-wider">
                            {a.student.studentCode}
                          </span>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                          <div className="flex items-center gap-2 sm:gap-2.5">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center shrink-0 border border-violet-200/80 dark:border-violet-800/60">
                              {a.student.name.slice(0, 1).toUpperCase()}
                            </div>
                            <span className="truncate max-w-[150px] sm:max-w-none">{a.student.name}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-center font-mono">
                          <Badge
                            variant={
                              percent >= 80
                                ? "emerald"
                                : percent >= 60
                                ? "indigo"
                                : percent >= 40
                                ? "amber"
                                : "rose"
                            }
                            className="font-bold text-xs"
                          >
                            {a.score} / {a.totalQuestions} ({percent}%)
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-3.5 text-right text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          <span className="inline-flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            {new Date(a.submittedAt).toLocaleString("uz-UZ", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      {/* 4. Question Breakdown Analytics */}
      {attempts.length > 0 && (
        <section className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-base sm:text-lg">
              {t("results.breakdownTitle")}
            </h2>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {breakdown.map((b, index) => {
              const barColor =
                b.percent >= 75
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : b.percent >= 50
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                  : "bg-gradient-to-r from-amber-500 to-rose-500";

              return (
                <Card key={b.id} className="p-3.5 sm:p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold mr-1.5">{index + 1}.</span>
                      {b.text}
                    </p>
                    <Badge
                      variant={b.percent >= 75 ? "emerald" : b.percent >= 50 ? "indigo" : "rose"}
                      className="shrink-0 font-mono"
                    >
                      {b.percent}%
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                        style={{ width: `${b.percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                      <span>{b.correctCount} to&apos;g&apos;ri</span>
                      <span>{totalAttempts - b.correctCount} xato</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
