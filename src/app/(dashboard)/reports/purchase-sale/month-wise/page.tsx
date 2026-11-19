import { listPurchaseSaleMonthReport } from "@/lib/actions/reports";
import { PurchaseSaleList } from "../PurchaseSaleList";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function PurchaseSaleMonthWisePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const rows = await listPurchaseSaleMonthReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <PurchaseSaleList
      view="month"
      rows={rows}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}