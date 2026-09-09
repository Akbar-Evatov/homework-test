import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { prisma, getDatabaseUrl } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let cfKeys: string[] = [];
  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx && ctx.env) {
      cfKeys = Object.keys(ctx.env);
    }
  } catch (err: any) {
    cfKeys = [`Error: ${err?.message || String(err)}`];
  }

  let dbStatus = "untested";
  let classCount = 0;
  let dbError = "";
  try {
    const url = getDatabaseUrl();
    if (!url) {
      dbStatus = "DATABASE_URL is empty";
    } else {
      classCount = await prisma.class.count();
      dbStatus = "connected";
    }
  } catch (err: any) {
    dbStatus = "query_failed";
    dbError = err?.message || String(err);
  }

  // Only return variable NAMES (never expose actual secret values)
  const processKeys = Object.keys(process.env).filter(
    (k) => !k.startsWith("npm_") && !k.startsWith("__")
  );

  return NextResponse.json({
    status: "ok",
    hasDatabaseUrl: Boolean(getDatabaseUrl()),
    hasTeacherPasswordInProcess: Boolean(process.env.TEACHER_PASSWORD),
    hasTeacherPasswordInCloudflare: cfKeys.includes("TEACHER_PASSWORD"),
    dbStatus,
    classCount,
    dbError: dbError || undefined,
    processEnvKeys: processKeys,
    cloudflareEnvKeys: cfKeys,
  });
}
