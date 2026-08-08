import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import AddStudentForm from "./add-student-form";
import DeleteClassButton from "./delete-class-button";

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
      assignments: { select: { testId: true } },
    },
  });

  if (!cls) notFound();

  const totalAssignedTests = cls.assignments.length;
  const studentIds = cls.students.map((s) => s.id);

  const attempts = studentIds.length
    ? await prisma.attempt.findMany({
        where: { studentId: { in: studentIds } },
        select: { studentId: true, score: true, totalQuestions: true },
      })
    : [];

  const attemptsByStudent = new Map<number, { score: number; totalQuestions: number }[]>();
  for (const a of attempts) {
    const list = attemptsByStudent.get(a.studentId) ?? [];
    list.push({ score: a.score, totalQuestions: a.totalQuestions });
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
    return { ...s, testsTaken, testsPending, averageScore };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← {t("common.back")}
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-slate-900">{cls.name}</h1>
        </div>
        <DeleteClassButton classId={cls.id} />
      </div>

      <Card className="p-4">
        <h2 className="mb-3 font-medium text-slate-900">{t("classes.addStudentTitle")}</h2>
        <AddStudentForm classId={cls.id} />
      </Card>

      <section>
        <h2 className="mb-3 font-medium text-slate-900">{t("classes.rosterTitle")}</h2>
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">{t("classes.noStudents")}</p>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2">{t("classes.studentCode")}</th>
                  <th className="px-4 py-2">{t("classes.studentName")}</th>
                  <th className="px-4 py-2">{t("classes.testsTaken")}</th>
                  <th className="px-4 py-2">{t("classes.testsPending")}</th>
                  <th className="px-4 py-2">{t("classes.averageScore")}</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 text-slate-900 last:border-0">
                    <td className="px-4 py-2 font-mono">{s.studentCode}</td>
                    <td className="px-4 py-2">{s.name}</td>
                    <td className="px-4 py-2">{s.testsTaken}</td>
                    <td className="px-4 py-2">{s.testsPending}</td>
                    <td className="px-4 py-2">
                      {s.averageScore === null ? "—" : `${s.averageScore}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}
