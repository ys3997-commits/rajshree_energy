export type PaymentsSection = "transactions" | "discount";
export type FundFlowType = "received" | "paid";

/** @deprecated use PaymentsSection */
export type PaymentsTab = PaymentsSection;

export function parseFundFlowType(value?: string | null): FundFlowType | "" {
  const v = value?.trim().toLowerCase() ?? "";
  return v === "received" || v === "paid" ? v : "";
}

export function paymentsHref(opts: {
  section?: PaymentsSection;
  /** @deprecated use section */
  tab?: PaymentsSection;
  page?: number;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}): string {
  const section = opts.section ?? opts.tab ?? "transactions";
  const base =
    section === "discount" ? "/payments/discount" : "/payments";
  const q = new URLSearchParams();
  const dateFrom = opts.dateFrom?.trim() ?? "";
  const dateTo = opts.dateTo?.trim() ?? "";
  const party = opts.party?.trim() ?? "";
  const type = parseFundFlowType(opts.type);
  if (dateFrom) q.set("dateFrom", dateFrom);
  if (dateTo) q.set("dateTo", dateTo);
  if (party) q.set("party", party);
  if (type) q.set("type", type);
  if (opts.page && opts.page > 1) q.set("page", String(opts.page));
  const s = q.toString();
  return s ? `${base}?${s}` : base;
}
