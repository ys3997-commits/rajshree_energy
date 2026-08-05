import { redirect } from "next/navigation";

/** Old Quality report detail URL → Report → Product */
export default async function QualityReportDetailRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/reports/product/${id}`);
}
