import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { generateUniqueStudentCode } from "@/lib/student-code";

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

  // Generate an unguessable, cryptographically random student code (e.g. "K7X9P2")
  const studentCode = await generateUniqueStudentCode(6);

  const student = await prisma.student.create({
    data: {
      name,
      classId,
      studentCode,
    },
  });

  return NextResponse.json({ student }, { status: 201 });
}
