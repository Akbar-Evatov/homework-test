import { NextResponse } from "next/server";
import { checkTeacherPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const password = body?.password;

    if (typeof password !== "string" || !(await checkTeacherPassword(password))) {
      return NextResponse.json(
        { error: "Noto'g'ri parol" },
        { status: 401 }
      );
    }

    await createSession();
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: error?.message || "Server xatosi yuz berdi" },
      { status: 500 }
    );
  }
}
