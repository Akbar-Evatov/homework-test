import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { validateTestInput } from "@/lib/test-validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId } = await params;

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
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ test });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId } = await params;
  const body = await request.json().catch(() => null);
  const input = validateTestInput(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid test data" }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.question.deleteMany({ where: { testId } });
    return tx.test.update({
      where: { id: testId },
      data: {
        title: input.title,
        questions: {
          create: input.questions.map((q, qIndex) => ({
            text: q.text,
            order: qIndex,
            imageUrl: q.imageUrl,
            choices: {
              create: q.choices.map((c, cIndex) => ({
                text: c.text,
                order: cIndex,
                isCorrect: c.isCorrect,
              })),
            },
          })),
        },
      },
    });
  });

  return NextResponse.json({ test: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId } = await params;
  await prisma.test.delete({ where: { id: testId } });

  return NextResponse.json({ ok: true });
}
