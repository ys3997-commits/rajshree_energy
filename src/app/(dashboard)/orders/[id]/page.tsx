import { notFound } from "next/navigation";
import { getOrder } from "@/lib/actions/orders";
import { listPortOptions } from "@/lib/actions/ports";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listCustomers } from "@/lib/actions/customers";
import { getCurrentAccess } from "@/lib/auth/access";
import { hasFullPower } from "@/lib/auth/fullPower";
import {
  displayOrderDigits,
  formatPurchaseGstAmount,
  formatPurchaseTcsAmount,
  formatPurchaseTotalAmount,
} from "@/app/(dashboard)/dispatches/dispatchListShared";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import {
  formatAmount,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatLorryNumber,
  formatQualityClass,
} from "@/lib/domain/format";
import { OrderDetailClient } from "./OrderDetailClient";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, qualityClasses, ports, access] = await Promise.all([
    getOrder(id),
    listQualityClasses(),
    listPortOptions(),
    getCurrentAccess(),
  ]);
  if (!order) notFound();
  if (access.kind === "none") notFound();

  const canEdit = hasFullPower(access);
  const customers = canEdit
    ? (await listCustomers({ activeOnly: true })).map((customer) => ({
        id: customer.id,
        name: customer.name,
        category: customer.category,
      }))
    : [];
  if (
    canEdit &&
    !customers.some((customer) => customer.id === order.customerId)
  ) {
    customers.unshift({
      id: order.customer.id,
      name: order.customer.name,
      category: order.customer.category,
    });
  }

  return (
    <OrderDetailClient
      canEdit={canEdit}
      customers={customers}
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
        numberOfLorries: order.numberOfLorries,
        dispatchedOrder: order.dispatchedOrder.toString(),
        closingQuantity: order.closingQuantity?.toString() ?? null,
        balanceOrder: order.balanceOrder?.toString() ?? null,
        gst: order.gst?.toString() ?? null,
        rate: order.rate?.toString() ?? null,
        finalRate: order.finalRate?.toString() ?? null,
        creditDays: order.creditDays,
        qualityClassId: order.qualityClassId,
        portId: order.portId,
        deliveryTerms: order.deliveryTerms,
        customerId: order.customerId,
        customer: {
          name: order.customer.name,
          category: order.customer.category,
        },
        dispatches: order.dispatches.map((d) => {
          const quality =
            d.purchaseOrder?.qualityClass ??
            d.vessel.qualityClass ??
            order.qualityClass ??
            null;
          return {
            id: d.id,
            dispatchNumber: displayDispatchNumber(d.dispatchNumber),
            date: formatDateDdMmYyyy(d.dispatchDate.toISOString()),
            lorryNumber: formatLorryNumber(d.lorryNumber) ?? "—",
            weight: formatDispatchMt(d.dispatchedQuantity),
            vesselName: d.vessel.vesselName,
            quality: formatQualityClass(quality),
            purchaseOrderId: d.purchaseOrder?.id ?? null,
            purchasePo: d.purchaseOrder
              ? displayOrderDigits(d.purchaseOrder.poNumber, "purchase")
              : displayOrderDigits(d.purchasePoNumber, "purchase"),
            purchaseInvoice: d.purchaseInvoiceNumber ?? "—",
            vendor: d.purchaseOrder?.importer?.name ?? "—",
            basicPrice: formatAmount(d.purchaseOrder?.rate),
            gst: formatPurchaseGstAmount(
              d.dispatchedQuantity,
              d.purchaseOrder?.rate,
            ),
            tcs: formatPurchaseTcsAmount(
              d.dispatchedQuantity,
              d.purchaseOrder?.rate,
            ),
            invoiceAmount: formatPurchaseTotalAmount(
              d.dispatchedQuantity,
              d.purchaseOrder?.rate,
            ),
          };
        }),
      }}
    />
  );
}
