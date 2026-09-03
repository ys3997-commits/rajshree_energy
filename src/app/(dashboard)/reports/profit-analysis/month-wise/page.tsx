import { listProfitAnalysisMonthReport } from "@/lib/actions/reports";
import { ProfitAnalysisList } from "../ProfitAnalysisList";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function ProfitAnalysisMonthWisePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const rows = await listProfitAnalysisMonthReport({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  return (
    <ProfitAnalysisList
      view="month"
      rows={rows}
      dateFrom={dateFrom}
      dateTo={dateTo}
    />
  );
}
