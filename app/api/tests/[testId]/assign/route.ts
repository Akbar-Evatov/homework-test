import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { testId } = await params;
  const body = await request.json().catch(() => null);
  const classIds = Array.isArray(body?.classIds)
    ? body.classIds.filter((id: unknown) => typeof id === "string")
    : null;

  if (!classIds) {
    return NextResponse.json({ error: "classIds must be an array" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.testAssignment.deleteMany({
      where: { testId, classId: { notIn: classIds } },
    }),
    ...classIds.map((classId: string) =>
      prisma.testAssignment.upsert({
        where: { testId_classId: { testId, classId } },
        create: { testId, classId },
        update: {},
      })
    ),
  ]);

  return NextResponse.json({ ok: true });
}
