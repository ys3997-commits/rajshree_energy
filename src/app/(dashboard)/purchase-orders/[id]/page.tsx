import { notFound } from "next/navigation";
import { getPurchaseOrder } from "@/lib/actions/purchaseOrders";
import { lineProfit } from "@/lib/domain/computations";
import { PurchaseOrderDetailClient } from "./PurchaseOrderDetailClient";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getPurchaseOrder(id);
  if (!order) notFound();

  return (
    <PurchaseOrderDetailClient
      order={{
        id: order.id,
        poNumber: order.poNumber,
        orderType: order.orderType,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate?.toISOString() ?? null,
        quantity: order.quantity?.toString() ?? null,
        dispatchedOrder: order.dispatchedOrder.toString(),
        balanceOrder: order.balanceOrder?.toString() ?? null,
        rate: order.rate?.toString() ?? null,
        quality: order.quality,
        importer: { name: order.importer.name },
        vessel: { vesselName: order.vessel.vesselName },
        orderBy: order.orderBy ? { name: order.orderBy.name } : null,
        dispatches: order.dispatches.map((d) => ({
          id: d.id,
          dispatchDate: d.dispatchDate.toISOString(),
          dispatchedQuantity: d.dispatchedQuantity.toString(),
          dispatchTerms: d.dispatchTerms,
          freight: d.freight?.toString() ?? null,
          lorryNumber: d.lorryNumber,
          receiptStatus: d.receiptStatus,
          softCopyStatus: d.softCopyStatus,
          entryInTally: d.entryInTally,
          order: d.order
            ? { id: d.order.id, poNumber: d.order.poNumber }
            : null,
          transporter: d.transporter,
          lineProfit:
            lineProfit({
              saleRate: d.order?.rate ?? null,
              costRate: order.rate,
              quantity: d.dispatchedQuantity,
              dispatchTerms: d.dispatchTerms,
              freight: d.freight,
            })?.toString() ?? null,
        })),
      }}
    />
  );
}
