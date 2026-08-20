import { listBills } from "@/lib/actions/bills";
import { BillsClient } from "./BillsClient";

type SearchParams = Promise<{ page?: string; status?: string }>;

export default async function BillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const initial = await listBills({ page, status: sp.status });
  return <BillsClient initial={initial} statusFilter={sp.status ?? "all"} />;
}
