import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const studentCode = typeof body?.studentId === "string" ? body.studentId.trim() : "";
  const testId = typeof body?.testId === "string" ? body.testId : "";

  if (!studentCode || !testId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { studentCode },
  });

  if (!student) {
    return NextResponse.json({ status: "student_not_found" }, { status: 404 });
  }

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { choices: { orderBy: { order: "asc" } } },
      },
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

  const existingAttempt = await prisma.attempt.findUnique({
    where: { studentId_testId: { studentId: student.id, testId } },
  });

  if (existingAttempt) {
    if (!test.showScoreImmediately) {
      return NextResponse.json({ status: "already_submitted_pending" });
    }
    return NextResponse.json({
      status: "already_submitted",
      score: existingAttempt.score,
      totalQuestions: existingAttempt.totalQuestions,
    });
  }

  return NextResponse.json({
    status: "ok",
    studentName: student.name,
    test: {
      id: test.id,
      title: test.title,
      questions: test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        imageUrl: q.imageUrl,
        choices: q.choices.map((c) => ({ id: c.id, text: c.text })),
      })),
    },
  });
}
