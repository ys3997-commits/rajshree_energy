import { listSaleGeoAnalysisReport } from "@/lib/actions/reports";
import { SaleAnalysisClient } from "./SaleAnalysisClient";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function SaleAnalysisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const dateFrom = params.dateFrom?.trim() ?? "";
  const dateTo = params.dateTo?.trim() ?? "";

  const report = await listSaleGeoAnalysisReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <SaleAnalysisClient
      report={report}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
