import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { cache } from "react";

// Polyfill WebSocket in Node.js environments if native WebSocket is not present
if (!globalThis.WebSocket && ws) {
  neonConfig.webSocketConstructor = ws;
}
// In serverless / edge environments like Cloudflare Workers, query via HTTP fetch
// to avoid WebSocket lifecycle restrictions across requests.
neonConfig.poolQueryViaFetch = true;

export function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  try {
    const globalAny = globalThis as any;
    const ctx = globalAny[Symbol.for("__cloudflare-context__")];
    if (ctx?.env?.DATABASE_URL) {
      return ctx.env.DATABASE_URL;
    }
  } catch {}
  return "";
}

function createPrismaClient(): PrismaClient {
  const currentUrl = getDatabaseUrl();

  if (!currentUrl) {
    // During build time or before request context, return dummy adapter
    const adapter = new PrismaNeon({ connectionString: "" });
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaNeon({ connectionString: currentUrl });
  return new PrismaClient({ adapter });
}

// In production / Cloudflare Workers, scope client per request using React cache
// In development, preserve client on globalThis to avoid exhausting connections on hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getClient =
  process.env.NODE_ENV === "production"
    ? cache(() => createPrismaClient())
    : () => {
        if (!globalForPrisma.prisma) {
          globalForPrisma.prisma = createPrismaClient();
        }
        return globalForPrisma.prisma;
      };

// Proxy enables lazy initialization:
// 1. During `next build`, routes can be imported without requiring DATABASE_URL to be set.
// 2. At runtime, the connection string is read dynamically from the request environment.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

