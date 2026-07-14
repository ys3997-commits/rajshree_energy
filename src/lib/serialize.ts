/** Serialize Prisma Decimals (and Dates) for Client Component props. */
export function serialize<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (v != null && typeof v === "object" && typeof v.toFixed === "function") {
        // Prisma Decimal
        return v.toString();
      }
      return v;
    }),
  ) as T;
}
