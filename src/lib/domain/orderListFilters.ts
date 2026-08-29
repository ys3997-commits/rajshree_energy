/** Default list filter when the status query param is omitted. */
export const DEFAULT_ORDER_LIST_STATUS = "RUNNING" as const;

/**
 * Sale / purchase order list pages: default to Running on first visit.
 * Explicit `?status=` means All; RUNNING and COMPLETED pass through.
 */
export function resolveOrderListStatusFilter(
  status: string | undefined,
): "" | "RUNNING" | "COMPLETED" {
  if (status === undefined) return DEFAULT_ORDER_LIST_STATUS;
  if (status === "") return "";
  if (status === "RUNNING" || status === "COMPLETED") return status;
  return DEFAULT_ORDER_LIST_STATUS;
}
