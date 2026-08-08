import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { gradeAttempt } from "@/lib/grading";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const studentCode = typeof body?.studentId === "string" ? body.studentId.trim() : "";
  const testId = typeof body?.testId === "string" ? body.testId : "";
  const answers =
    typeof body?.answers === "object" && body?.answers !== null
      ? (body.answers as Record<string, string>)
      : null;

  if (!studentCode || !testId || !answers) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { studentCode } });
  if (!student) {
    return NextResponse.json({ status: "student_not_found" }, { status: 404 });
  }

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      questions: { include: { choices: true } },
      assignments: { select: { classId: true } },
    },
  });
  if (!test) {
    return NextResponse.json({ status: "test_not_found" }, { status: 404 });
  }

  const isAssigned = test.assignments.some((a) => a.classId === student.classId);
  if (!isAssigned) {
    return NextResponse.json({ status: "not_assigned" }, { status: 403 });
  }

  const { score, totalQuestions } = gradeAttempt(test.questions, answers);

  try {
    const attempt = await prisma.attempt.create({
      data: {
        studentId: student.id,
        testId: test.id,
        answers,
        score,
        totalQuestions,
      },
    });

    return NextResponse.json(
      test.showScoreImmediately
        ? { status: "ok", score: attempt.score, totalQuestions: attempt.totalQuestions }
        : { status: "pending_release" }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const existing = await prisma.attempt.findUnique({
        where: { studentId_testId: { studentId: student.id, testId } },
      });
      if (existing) {
        return NextResponse.json(
          test.showScoreImmediately
            ? { status: "ok", score: existing.score, totalQuestions: existing.totalQuestions }
            : { status: "pending_release" }
        );
      }
    }
    throw err;
  }
}
