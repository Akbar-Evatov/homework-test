import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { validateTestInput } from "@/lib/test-validation";

export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tests = await prisma.test.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true, assignments: true } } },
  });

  return NextResponse.json({ tests });
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const input = validateTestInput(body);
  if (!input) {
    return NextResponse.json({ error: "Invalid test data" }, { status: 400 });
  }

  const created = await prisma.test.create({
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

  return NextResponse.json({ test: created }, { status: 201 });
}
