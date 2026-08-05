import { redirect } from "next/navigation";

/** Old Transport engine URL → Report → Transport */
export default function TransportEngineRedirectPage() {
  redirect("/reports/transport");
}
