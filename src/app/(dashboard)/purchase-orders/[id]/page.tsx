import { notFound } from "next/navigation";
import { getPurchaseOrder } from "@/lib/actions/purchaseOrders";
import { listQualityClasses } from "@/lib/actions/qualities";
import { lineProfit } from "@/lib/domain/computations";
import { PurchaseOrderDetailClient } from "./PurchaseOrderDetailClient";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, qualityClasses] = await Promise.all([
    getPurchaseOrder(id),
    listQualityClasses(),
  ]);
  if (!order) notFound();

  return (
    <PurchaseOrderDetailClient
      qualityClasses={qualityClasses.map((qc) => ({
        id: qc.id,
        domestic: qc.domestic,
        origin: qc.origin,
        qualityOption: qc.qualityOption,
      }))}
      order={{
        id: order.id,
        poNumber: order.poNumber,
        orderType: order.orderType,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate?.toISOString() ?? null,
        quantity: order.quantity?.toString() ?? null,
        dispatchedOrder: order.dispatchedOrder.toString(),
        closingQuantity: order.closingQuantity?.toString() ?? null,
        balanceOrder: order.balanceOrder?.toString() ?? null,
        rate: order.rate?.toString() ?? null,
        finalRate: order.finalRate?.toString() ?? null,
        qualityClassId: order.qualityClassId,
        importer: { name: order.importer.name },
        vessel: { vesselName: order.vessel.vesselName },
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
