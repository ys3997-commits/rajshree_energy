import { listPendingReceipts } from "@/lib/actions/receipts";
import { PendingReceiptsClient } from "./PendingReceiptsClient";

export default async function PendingReceiptsPage() {
  const rows = await listPendingReceipts();
  return (
    <PendingReceiptsClient
      initial={rows.map((r) => ({
        id: r.id,
        poNumber: r.poNumber,
        dispatchDate: r.dispatchDate.toISOString(),
        dispatchedQuantity: r.dispatchedQuantity.toString(),
        lorryNumber: r.lorryNumber,
        vessel: r.vessel,
        importer: r.importer,
      }))}
    />
  );
}
