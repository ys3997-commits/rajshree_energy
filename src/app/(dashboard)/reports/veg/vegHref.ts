export type VegFlowSection = "payment" | "discount";
export type VegFlowType = "received" | "paid";

export function parseVegFlowType(value?: string | null): VegFlowType | "" {
  const v = value?.trim().toLowerCase() ?? "";
  return v === "received" || v === "paid" ? v : "";
}

export function vegHref(opts: {
  section?: VegFlowSection;
  page?: number;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): string {
  const section = opts.section ?? "payment";
  const base = section === "discount" ? "/reports/veg/discount" : "/reports/veg";
  const q = new URLSearchParams();
  const dateFrom = opts.dateFrom?.trim() ?? "";
  const dateTo = opts.dateTo?.trim() ?? "";
  const party = opts.party?.trim() ?? "";
  const type = parseVegFlowType(opts.type);
  if (dateFrom) q.set("dateFrom", dateFrom);
  if (dateTo) q.set("dateTo", dateTo);
  if (party) q.set("party", party);
  if (section === "discount" && type) q.set("type", type);
  if (opts.page && opts.page > 1) q.set("page", String(opts.page));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}

export function vegLedgerHref(opts: {
  customerId?: string;
  vegId?: string;
  dateFrom?: string;
  dateTo?: string;
}): string {
  const q = new URLSearchParams();
  const customerId = opts.customerId?.trim() ?? "";
  const vegId = opts.vegId?.trim() ?? "";
  const dateFrom = opts.dateFrom?.trim() ?? "";
  const dateTo = opts.dateTo?.trim() ?? "";
  if (customerId) q.set("customerId", customerId);
  if (vegId) q.set("vegId", vegId);
  if (dateFrom) q.set("dateFrom", dateFrom);
  if (dateTo) q.set("dateTo", dateTo);
  const s = q.toString();
  return s ? `/reports/veg/ledger?${s}` : "/reports/veg/ledger";
}
