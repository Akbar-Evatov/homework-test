import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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

  // Only return variable NAMES (never expose actual secret values)
  const processKeys = Object.keys(process.env).filter(
    (k) => !k.startsWith("npm_") && !k.startsWith("__")
  );

  return NextResponse.json({
    status: "ok",
    hasTeacherPasswordInProcess: Boolean(process.env.TEACHER_PASSWORD),
    hasTeacherPasswordInCloudflare: cfKeys.includes("TEACHER_PASSWORD"),
    processEnvKeys: processKeys,
    cloudflareEnvKeys: cfKeys,
  });
}
