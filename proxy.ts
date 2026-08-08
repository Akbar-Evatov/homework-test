import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const isAuthenticated = await verifySession();

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
