import { redirect } from "next/navigation";

/** Old Vessel report URL → Report → Vessel */
export default function VesselReportRedirectPage() {
  redirect("/reports/vessel");
}
