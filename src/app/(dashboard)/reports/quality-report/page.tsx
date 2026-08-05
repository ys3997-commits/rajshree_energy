import { redirect } from "next/navigation";

/** Old Quality report URL → Report → Product */
export default function QualityReportRedirectPage() {
  redirect("/reports/product");
}
