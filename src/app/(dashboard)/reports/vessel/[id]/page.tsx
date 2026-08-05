import { notFound } from "next/navigation";
import { getVesselReport } from "@/lib/actions/reports";
import { VesselReportDetail } from "./VesselReportDetail";

export default async function VesselReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getVesselReport(id);
  if (!report) notFound();

  return (
    <VesselReportDetail
      vessel={report.vessel}
      totals={report.totals}
      purchaseOrders={report.purchaseOrders}
    />
  );
}
