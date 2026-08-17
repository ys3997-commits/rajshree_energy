import { listProfitAnalysisReport } from "@/lib/actions/reports";
import { ProfitAnalysisList } from "./ProfitAnalysisList";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function ProfitAnalysisPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const rows = await listProfitAnalysisReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <ProfitAnalysisList rows={rows} dateFrom={dateFrom} dateTo={dateTo} />
  );
}
