import { notFound } from "next/navigation";
import { getOrder } from "@/lib/actions/orders";
import { lineProfit } from "@/lib/domain/computations";
import { OrderDetailClient } from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <OrderDetailClient
      order={{
        id: order.id,
        poNumber: order.poNumber,
        orderType: order.orderType,
        orderStatus: order.orderStatus,
        orderDate: order.orderDate?.toISOString() ?? null,
        quantity: order.quantity?.toString() ?? null,
        dispatchedOrder: order.dispatchedOrder.toString(),
        balanceOrder: order.balanceOrder?.toString() ?? null,
        gst: order.gst?.toString() ?? null,
        rate: order.rate?.toString() ?? null,
        creditDays: order.creditDays,
        quality: order.quality,
        area: order.area,
        customer: { name: order.customer.name },
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
              saleRate: order.rate,
              costRate: d.purchaseOrder?.rate ?? null,
              quantity: d.dispatchedQuantity,
              dispatchTerms: d.dispatchTerms,
              freight: d.freight,
            })?.toString() ?? null,
        })),
      }}
    />
  );
}
