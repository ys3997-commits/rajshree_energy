import { listPurchaseSaleReport } from "@/lib/actions/reports";
import { PurchaseSaleList } from "../PurchaseSaleList";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function PurchaseSaleDailyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const rows = await listPurchaseSaleReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <PurchaseSaleList
      view="daily"
      rows={rows}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
