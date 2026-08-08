import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: { orderBy: { id: "asc" } },
      assignments: { select: { testId: true } },
    },
  });

  if (!cls) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

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

    return {
      id: s.id,
      studentCode: s.studentCode,
      name: s.name,
      testsTaken,
      testsPending,
      averageScore,
    };
  });

  return NextResponse.json({
    class: { id: cls.id, name: cls.name, createdAt: cls.createdAt },
    totalAssignedTests,
    students,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updated = await prisma.class.update({
    where: { id: classId },
    data: { name },
  });

  return NextResponse.json({ class: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await params;
  await prisma.class.delete({ where: { id: classId } });

  return NextResponse.json({ ok: true });
}
