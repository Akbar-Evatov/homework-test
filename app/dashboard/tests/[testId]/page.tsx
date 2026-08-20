import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { t } from "@/lib/i18n";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import TestEditor from "../test-editor";
import AssignClasses from "./assign-classes";
import ShareLink from "./share-link";
import {
  ArrowLeftIcon,
  TestIcon,
  SchoolIcon,
  ChartIcon,
} from "@/components/ui/Icons";

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
        _count: { select: { attempts: true } },
      },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!test) notFound();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header with Breadcrumbs and Quick Links */}
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
              <TestIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {test.title}
                </h1>
                <Badge variant="violet">{test.questions.length} savol</Badge>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                {t("tests.editTestTitle")} — savollar va sozlamalar
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/tests/${test.id}/results`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 hover:bg-violet-100/80 dark:hover:bg-violet-900/60 border border-violet-200/80 dark:border-violet-800/60 transition-all shadow-2xs w-full sm:w-auto"
        >
          <ChartIcon className="w-4 h-4" />
          <span>{t("dashboard.viewResults")} ({test._count.attempts})</span>
        </Link>
      </div>

      {/* 2. Main Test Editor */}
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

      {/* 3. Assign to Classes Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60">
            <SchoolIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
              {t("tests.assignSectionTitle")}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Qaysi sinf o&apos;quvchilari ushbu testni topshirishi mumkinligini belgilang
            </p>
          </div>
        </div>
        <AssignClasses
          testId={test.id}
          allClasses={allClasses}
          assignedClassIds={test.assignments.map((a) => a.classId)}
        />
      </Card>

      {/* 4. Share Link Section */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
            <TestIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
              {t("tests.shareLinkTitle")}
            </h2>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Testni topshirish uchun to&apos;g&apos;ridan-to&apos;g&apos;ri havola
            </p>
          </div>
        </div>
        <ShareLink testId={test.id} />
      </Card>
    </div>
  );
}
