import dns from "node:dns";
import { Prisma, PrismaClient } from "@/generated/prisma";

// Windows/local DNS often returns IPv6 first; Supabase pooler reaches via IPv4.
dns.setDefaultResultOrder("ipv4first");

const TRANSIENT_CODES = new Set(["P1001", "P1017", "P2024", "P1008"]);
const MAX_TRANSIENT_RETRIES = 2;

function isTransientPrismaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_CODES.has(error.code);
  }
  const message = error instanceof Error ? error.message : String(error);
  return (
    /can't reach database server/i.test(message) ||
    /server has closed the connection/i.test(message) ||
    /forcibly closed by the remote host/i.test(message) ||
    /timed out fetching a new connection/i.test(message)
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Keep Prisma from giving up while a few heavy queries hold the tiny pooler limit. */
function datasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  let next = url;
  const join = () => (next.includes("?") ? "&" : "?");
  if (!/[?&]pool_timeout=/.test(next)) {
    next += `${join()}pool_timeout=20`;
  }
  if (!/[?&]connect_timeout=/.test(next)) {
    next += `${join()}connect_timeout=10`;
  }
  return next;
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasourceUrl: datasourceUrl(),
  });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;
        for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
          try {
            return await query(args);
          } catch (error) {
            lastError = error;
            if (!isTransientPrismaError(error) || attempt === MAX_TRANSIENT_RETRIES) {
              throw error;
            }
            await wait(400 * (attempt + 1));
          }
        }
        throw lastError;
      },
    },
  });
}

type AppPrisma = ReturnType<typeof createPrismaClient>;

/** Interactive transaction client from `prisma.$transaction` (extended client). */
export type PrismaTx = Omit<
  AppPrisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrisma | undefined;
  prismaGen: number | undefined;
};

/** Bump when the generated client or pool settings change so HMR drops stale sockets. */
const PRISMA_GEN = 28;

function getPrisma(): AppPrisma {
  if (globalForPrisma.prismaGen === PRISMA_GEN && globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect();
  }
  const client = createPrismaClient();
  globalForPrisma.prisma = client;
  globalForPrisma.prismaGen = PRISMA_GEN;
  return client;
}

export const prisma = getPrisma();
