import { redirect } from "next/navigation";

/** Old Vessel report detail URL → Report → Vessel */
export default async function VesselReportDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/reports/vessel/${id}`);
}
