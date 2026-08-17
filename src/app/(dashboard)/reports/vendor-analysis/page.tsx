import { listVendorAnalysisReport } from "@/lib/actions/reports";
import { VendorAnalysisList } from "./VendorAnalysisList";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function VendorAnalysisListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const vendors = await listVendorAnalysisReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <VendorAnalysisList
      vendors={vendors}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
