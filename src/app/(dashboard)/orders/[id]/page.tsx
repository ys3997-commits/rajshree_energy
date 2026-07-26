import { notFound } from "next/navigation";
import { getOrder } from "@/lib/actions/orders";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import {
  lineProfit,
  purchaseCostRate,
  saleRevenueRate,
} from "@/lib/domain/computations";
import { OrderDetailClient } from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, qualityClasses, ports] = await Promise.all([
    getOrder(id),
    listQualityClasses(),
    listPortOptions(),
  ]);
  if (!order) notFound();

  return (
    <OrderDetailClient
      qualityClasses={qualityClasses.map((qc) => ({
        id: qc.id,
        domestic: qc.domestic,
        origin: qc.origin,
        qualityOption: qc.qualityOption,
      }))}
      ports={ports.map((p) => ({ id: p.id, name: p.name }))}
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
        gst: order.gst?.toString() ?? null,
        rate: order.rate?.toString() ?? null,
        finalRate: order.finalRate?.toString() ?? null,
        creditDays: order.creditDays,
        qualityClassId: order.qualityClassId,
        portId: order.portId,
        customer: {
          name: order.customer.name,
          category: order.customer.category,
        },
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
          purchasePoNumber: d.purchasePoNumber,
          purchaseOrder: d.purchaseOrder
            ? {
                poNumber: d.purchaseOrder.poNumber,
                importer: d.purchaseOrder.importer,
                vessel: d.purchaseOrder.vessel,
              }
            : null,
          transporter: d.transporter,
          lineProfit:
            lineProfit({
              saleRate: saleRevenueRate(order),
              costRate: d.purchaseOrder
                ? purchaseCostRate(d.purchaseOrder)
                : null,
              quantity: d.dispatchedQuantity,
              dispatchTerms: d.dispatchTerms,
              freight: d.freight,
            })?.toString() ?? null,
        })),
      }}
    />
  );
}
