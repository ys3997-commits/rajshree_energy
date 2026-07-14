import { listTransporters } from "@/lib/actions/transporters";
import { TransportersClient } from "./TransportersClient";

export default async function TransportersPage() {
  const rows = await listTransporters();
  return <TransportersClient initial={rows} />;
}
