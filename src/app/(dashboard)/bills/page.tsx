import { listBills } from "@/lib/actions/bills";
import { listOwnerOptions } from "@/lib/actions/option-lists";
import { BillsClient } from "./BillsClient";

type SearchParams = Promise<{
  page?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  approver?: string;
  sentBy?: string;
}>;

export default async function BillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";
  const approver = sp.approver?.trim() || "";
  const sentBy = sp.sentBy?.trim() || "";
  const [initial, owners] = await Promise.all([
    listBills({
      page,
      status: sp.status,
      dateFrom,
      dateTo,
      approver,
      sentBy,
    }),
    listOwnerOptions(),
  ]);
  return (
    <BillsClient
      initial={initial}
      statusFilter={sp.status ?? "all"}
      dateFrom={dateFrom}
      dateTo={dateTo}
      approver={approver}
      sentBy={sentBy}
      owners={owners.map((o) => o.name)}
    />
  );
}
