import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";

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

  const breakdown = test.questions.map((q) => {
    const correctChoiceId = q.choices.find((c) => c.isCorrect)?.id;
    const correctCount = attempts.filter((a) => {
      const answers = a.answers as Record<string, string>;
      return answers[q.id] === correctChoiceId;
    }).length;
    const percent = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    return { id: q.id, text: q.text, percent };
  });

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
          ← {t("common.back")}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          {t("results.title")}: {test.title}
        </h1>
      </div>

      <section>
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-500">{t("results.noAttempts")}</p>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2">{t("results.idColumn")}</th>
                  <th className="px-4 py-2">{t("results.studentColumn")}</th>
                  <th className="px-4 py-2">{t("results.scoreColumn")}</th>
                  <th className="px-4 py-2">{t("results.submittedAtColumn")}</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-100 text-slate-900 last:border-0">
                    <td className="px-4 py-2 font-mono">{a.student.studentCode}</td>
                    <td className="px-4 py-2">{a.student.name}</td>
                    <td className="px-4 py-2">
                      {a.score} / {a.totalQuestions}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(a.submittedAt).toLocaleString("uz-UZ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      {attempts.length > 0 && (
        <section>
          <h2 className="mb-3 font-medium text-slate-900">{t("results.breakdownTitle")}</h2>
          <div className="space-y-3">
            {breakdown.map((b, index) => (
              <Card key={b.id} className="p-3">
                <p className="mb-2 text-sm font-medium text-slate-900">
                  {index + 1}. {b.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${b.percent}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs text-slate-600">
                    {b.percent}% {t("results.percentCorrect")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
