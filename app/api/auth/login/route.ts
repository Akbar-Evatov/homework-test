import { NextResponse } from "next/server";
import { checkTeacherPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== "string" || !checkTeacherPassword(password)) {
    return NextResponse.json(
      { error: "Noto'g'ri parol" },
      { status: 401 }
    );
  }

  await createSession();
  return NextResponse.json({ ok: true });
}
