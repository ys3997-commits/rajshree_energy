import { redirect } from "next/navigation";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function PurchaseSalePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.dateFrom?.trim()) qs.set("dateFrom", sp.dateFrom.trim());
  if (sp.dateTo?.trim()) qs.set("dateTo", sp.dateTo.trim());
  const query = qs.toString();
  redirect(`/reports/purchase-sale/daily${query ? `?${query}` : ""}`);
}
