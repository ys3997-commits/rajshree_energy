import { AsyncLocalStorage } from "node:async_hooks";
import dns from "node:dns";
import { Prisma, PrismaClient } from "@/generated/prisma";

// Windows/local DNS often returns IPv6 first; Supabase pooler reaches via IPv4.
dns.setDefaultResultOrder("ipv4first");

const TRANSIENT_CODES = new Set(["P1001", "P1017", "P1008"]);
const MAX_TRANSIENT_RETRIES = 2;
/** Leave one pool connection free for a transaction that already started. */
const DB_SLOTS = 4;

type DbGate = { active: number; queue: Array<() => void> };

const gateGlobal = globalThis as unknown as { __rajshreeDbGate?: DbGate };
const dbSlot = new AsyncLocalStorage<true>();

function dbGate(): DbGate {
  return (gateGlobal.__rajshreeDbGate ??= { active: 0, queue: [] });
}

function acquireDbSlot(): Promise<void> {
  const gate = dbGate();
  if (gate.active < DB_SLOTS) {
    gate.active += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    gate.queue.push(resolve);
  });
}

function releaseDbSlot() {
  const gate = dbGate();
  const next = gate.queue.shift();
  if (next) {
    next();
    return;
  }
  if (gate.active > 0) gate.active -= 1;
}

/** Queue work so pages cannot stampede the 5-connection pool and time out. */
function withDbSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (dbSlot.getStore()) return fn();
  return acquireDbSlot().then(() =>
    dbSlot.run(true, async () => {
      try {
        return await fn();
      } finally {
        releaseDbSlot();
      }
    }),
  );
}

function isTransientPrismaError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRANSIENT_CODES.has(error.code);
  }
  const message = error instanceof Error ? error.message : String(error);
  return (
    /can't reach database server/i.test(message) ||
    /server has closed the connection/i.test(message) ||
    /forcibly closed by the remote host/i.test(message)
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
  if (!/[?&]connection_limit=/.test(next)) {
    next += `${join()}connection_limit=5`;
  }
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

  const extended = client.$extends({
    query: {
      async $allOperations({ args, query }) {
        return withDbSlot(async () => {
          let lastError: unknown;
          for (let attempt = 0; attempt <= MAX_TRANSIENT_RETRIES; attempt++) {
            try {
              return await query(args);
            } catch (error) {
              lastError = error;
              if (
                !isTransientPrismaError(error) ||
                attempt === MAX_TRANSIENT_RETRIES
              ) {
                throw error;
              }
              await wait(400 * (attempt + 1));
            }
          }
          throw lastError;
        });
      },
    },
  });

  const runTransaction = extended.$transaction.bind(extended);
  extended.$transaction = ((...args: unknown[]) =>
    withDbSlot(() =>
      runTransaction(...(args as Parameters<typeof extended.$transaction>)),
    )) as typeof extended.$transaction;

  return extended;
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
const PRISMA_GEN = 52;

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
