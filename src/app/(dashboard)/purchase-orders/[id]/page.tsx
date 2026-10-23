import { notFound } from "next/navigation";
import { getPurchaseOrder } from "@/lib/actions/purchaseOrders";
import { listQualityClasses } from "@/lib/actions/qualities";
import { listCustomers } from "@/lib/actions/customers";
import { getCurrentAccess } from "@/lib/auth/access";
import { hasFullPower } from "@/lib/auth/fullPower";
import {
  displayOrderDigits,
  formatSaleGstAmount,
  formatSaleTcsAmount,
  formatSaleTotalAmount,
} from "@/app/(dashboard)/dispatches/dispatchListShared";
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import {
  formatAmount,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
  formatQualityClass,
} from "@/lib/domain/format";
import { PurchaseOrderDetailClient } from "./PurchaseOrderDetailClient";

export default async function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, qualityClasses, access] = await Promise.all([
    getPurchaseOrder(id),
    listQualityClasses(),
    getCurrentAccess(),
  ]);
  if (!order) notFound();
  if (access.kind === "none") notFound();

  const canEdit = hasFullPower(access);
  const vendors = canEdit
    ? (await listCustomers({ activeOnly: true })).map((customer) => ({
        id: customer.id,
        name: customer.name,
      }))
    : [];
  if (
    canEdit &&
    !vendors.some((vendor) => vendor.id === order.importerId)
  ) {
    vendors.unshift({ id: order.importer.id, name: order.importer.name });
  }

  return (
    <PurchaseOrderDetailClient
      canEdit={canEdit}
      vendors={vendors}
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
        importerId: order.importerId,
        importer: { name: order.importer.name },
        vessel: { vesselName: order.vessel.vesselName },
        dispatches: order.dispatches.map((d) => {
          const quality =
            order.qualityClass ??
            d.vessel.qualityClass ??
            d.order?.qualityClass ??
            null;
          return {
            id: d.id,
            dispatchNumber: displayDispatchNumber(d.dispatchNumber),
            date: formatDateDdMmYyyy(d.dispatchDate.toISOString()),
            lorryNumber: formatLorryNumber(d.lorryNumber) ?? "—",
            weight: formatDispatchMt(d.dispatchedQuantity),
            vesselName: d.vessel.vesselName,
            quality: formatQualityClass(quality),
            saleOrderId: d.order?.id ?? null,
            salePo: d.order
              ? displayOrderDigits(d.order.poNumber, "sale")
              : "—",
            saleInvoice: d.saleInvoiceNumber ?? "—",
            customerName: d.order?.customer?.name ?? "—",
            basicPrice: formatAmount(d.order?.rate),
            gst: formatSaleGstAmount(d.dispatchedQuantity, d.order?.rate),
            tcs: formatSaleTcsAmount(
              d.dispatchedQuantity,
              d.order?.rate,
              d.order?.customer?.category,
            ),
            invoiceAmount: formatSaleTotalAmount(
              d.dispatchedQuantity,
              d.order?.rate,
              d.order?.customer?.category,
            ),
            deliveryTerms: formatDispatchTerms(d.dispatchTerms),
            transporterName: d.transporter?.name ?? "—",
            freightPmt: formatAmount(d.freight),
            freightAmount:
              d.freight == null
                ? "—"
                : formatAmount(d.freight.mul(d.dispatchedQuantity)),
          };
        }),
      }}
    />
  );
}
