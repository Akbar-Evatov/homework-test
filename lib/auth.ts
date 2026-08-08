import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE = "teacher_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession() {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await new SignJWT({ role: "teacher" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    return payload.role === "teacher";
  } catch {
    return false;
  }
}

export function checkTeacherPassword(password: string): boolean {
  const expected = process.env.TEACHER_PASSWORD;
  if (!expected) {
    throw new Error("TEACHER_PASSWORD environment variable is not set");
  }
  return password === expected;
}
