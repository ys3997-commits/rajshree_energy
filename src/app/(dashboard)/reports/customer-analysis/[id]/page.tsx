import { notFound } from "next/navigation";
import { getCustomerAnalysis } from "@/lib/actions/reports";
import { CustomerAnalysisDetail } from "./CustomerAnalysisDetail";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function CustomerAnalysisDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const filters = {
    dateFrom: sp.dateFrom || "",
    dateTo: sp.dateTo || "",
  };

  const analysis = await getCustomerAnalysis(id, filters);
  if (!analysis) notFound();

  return (
    <CustomerAnalysisDetail
      customer={analysis.customer}
      saleSide={analysis.saleSide}
      purchaseSide={analysis.purchaseSide}
      saleOrders={analysis.saleOrders}
      purchaseOrders={analysis.purchaseOrders}
      dispatches={analysis.dispatches}
      filters={filters}
    />
  );
}
