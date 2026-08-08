import { notFound } from "next/navigation";
import { getVesselSuppliedReport } from "@/lib/actions/reports";
import { VesselSuppliedDetail } from "./VesselSuppliedDetail";

export default async function VesselSuppliedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getVesselSuppliedReport(id);
  if (!report) notFound();

  return (
    <VesselSuppliedDetail
      vessel={report.vessel}
      customers={report.customers}
    />
  );
}
