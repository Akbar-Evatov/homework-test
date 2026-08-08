import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const classes = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { students: true, assignments: true } },
    },
  });

  return NextResponse.json({
    classes: classes.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt: c.createdAt,
      studentCount: c._count.students,
      testsAssignedCount: c._count.assignments,
    })),
  });
}

export async function POST(request: Request) {
  if (!(await verifySession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const created = await prisma.class.create({ data: { name } });
  return NextResponse.json({ class: created }, { status: 201 });
}
