import { listBills } from "@/lib/actions/bills";
import { listOwnerOptions } from "@/lib/actions/option-lists";
import { BillsClient } from "./BillsClient";

type SearchParams = Promise<{ page?: string; status?: string }>;

export default async function BillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const [initial, owners] = await Promise.all([
    listBills({ page, status: sp.status }),
    listOwnerOptions(),
  ]);
  return (
    <BillsClient
      initial={initial}
      statusFilter={sp.status ?? "all"}
      owners={owners.map((o) => o.name)}
    />
  );
}
