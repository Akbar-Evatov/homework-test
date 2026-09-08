import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Polyfill WebSocket in Node.js environments if native WebSocket is not present
if (!globalThis.WebSocket && ws) {
  neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  cachedUrl: string | undefined;
};

function getPrismaClient(): PrismaClient {
  const currentUrl = process.env.DATABASE_URL || "";

  if (globalForPrisma.prisma && globalForPrisma.cachedUrl === currentUrl && currentUrl !== "") {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaNeon({ connectionString: currentUrl });
  const client = new PrismaClient({ adapter });

  globalForPrisma.prisma = client;
  globalForPrisma.cachedUrl = currentUrl;

  return client;
}

// Proxy enables lazy initialization:
// 1. During `next build`, routes can be imported without requiring DATABASE_URL to be set.
// 2. At runtime, the connection string is read dynamically from the request environment.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
