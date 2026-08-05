import { notFound } from "next/navigation";
import { getQualityReport } from "@/lib/actions/reports";
import { QualityReportDetail } from "./QualityReportDetail";

export default async function QualityReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getQualityReport(id);
  if (!report) notFound();

  return (
    <QualityReportDetail
      qualityClass={report.qualityClass}
      totals={report.totals}
      vessels={report.vessels}
    />
  );
}
