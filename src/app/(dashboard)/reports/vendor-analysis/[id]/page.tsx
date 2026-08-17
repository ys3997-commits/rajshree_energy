import { notFound } from "next/navigation";
import { CustomerCategory } from "@/generated/prisma";
import { getCustomerAnalysis } from "@/lib/actions/reports";
import { CustomerAnalysisDetail } from "../../customer-analysis/[id]/CustomerAnalysisDetail";

type SearchParams = Promise<{
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function VendorAnalysisDetailPage({
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
  if (!analysis || analysis.customer.category !== CustomerCategory.SUPPLIER) {
    notFound();
  }

  return (
    <CustomerAnalysisDetail
      customer={analysis.customer}
      saleSide={analysis.saleSide}
      purchaseSide={analysis.purchaseSide}
      saleOrders={analysis.saleOrders}
      purchaseOrders={analysis.purchaseOrders}
      dispatches={analysis.dispatches}
      filters={filters}
      variant="vendor"
    />
  );
}
