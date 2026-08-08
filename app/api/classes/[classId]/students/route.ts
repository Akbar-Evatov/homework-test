import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

function formatStudentCode(id: number) {
  return `A${id.toString().padStart(3, "0")}`;
}

export async function POST(
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

  const classExists = await prisma.class.findUnique({ where: { id: classId } });
  if (!classExists) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  // Use a unique placeholder to avoid colliding with another concurrent
  // insert before the real, id-derived studentCode is assigned below.
  const student = await prisma.student.create({
    data: { name, classId, studentCode: `temp-${crypto.randomUUID()}` },
  });

  const updated = await prisma.student.update({
    where: { id: student.id },
    data: { studentCode: formatStudentCode(student.id) },
  });

  return NextResponse.json({ student: updated }, { status: 201 });
}
