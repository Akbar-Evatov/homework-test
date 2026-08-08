import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import TestEditor from "../test-editor";
import AssignClasses from "./assign-classes";
import ShareLink from "./share-link";

export const dynamic = "force-dynamic";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;

  const [test, allClasses] = await Promise.all([
    prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: { choices: { orderBy: { order: "asc" } } },
        },
        assignments: { select: { classId: true } },
      },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!test) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
          ← {t("common.back")}
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">
          {t("tests.editTestTitle")}
        </h1>
      </div>

      <TestEditor
        testId={test.id}
        initialTest={{
          title: test.title,
          questions: test.questions.map((q) => ({
            text: q.text,
            imageUrl: q.imageUrl,
            choices: q.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })),
          })),
        }}
      />

      <Card className="p-4">
        <h2 className="mb-3 font-medium text-slate-900">{t("tests.assignSectionTitle")}</h2>
        <AssignClasses
          testId={test.id}
          allClasses={allClasses}
          assignedClassIds={test.assignments.map((a) => a.classId)}
        />
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 font-medium text-slate-900">{t("tests.shareLinkTitle")}</h2>
        <ShareLink testId={test.id} />
      </Card>
    </div>
  );
}
