import { redirect } from "next/navigation";

/** Old Sales engine URL → Report → Sales */
export default function SalesEngineRedirectPage() {
  redirect("/reports/sales");
}
