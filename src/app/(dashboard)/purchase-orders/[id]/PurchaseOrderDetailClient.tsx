"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { DispatchTerms, OrderType } from "@/generated/prisma";
import { deleteDispatch } from "@/lib/actions/dispatch";
import {
  completeOpenPurchaseOrder,
  updatePurchaseOrderFields,
  deletePurchaseOrder,
} from "@/lib/actions/purchaseOrders";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
import { DISPATCH_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import { computePurchaseRateBreakdown } from "@/lib/domain/purchaseRate";
import { formatDispatchTerms, formatOrderStatusForDisplay, formatOrderType, formatRs, formatLorryNumber, displayOrderBalance, formatSaleOrderMt } from "@/lib/domain/format";
import { RateBreakdownFields } from "@/components/RateBreakdownFields";
import { QualityClassSelect } from "@/components/QualityClassSelect";

type DispatchRow = {
  id: string;
  dispatchDate: string;
  dispatchedQuantity: string;
  dispatchTerms: DispatchTerms;
  freight: string | null;
  lorryNumber: string | null;
  receiptStatus: string;
  softCopyStatus: boolean;
  entryInTally: boolean;
  lineProfit: string | null;
  canDelete: boolean;
  order: { id: string; poNumber: string } | null;
  transporter: { name: string } | null;
};

type QualityClassOpt = {
  id: string;
  domestic: boolean;
  origin: { name: string };
  qualityOption: { name: string };
};

type PurchaseOrderData = {
  id: string;
  poNumber: string;
  orderType: OrderType;
  orderStatus: string;
  orderDate: string | null;
  quantity: string | null;
  dispatchedOrder: string;
  closingQuantity: string | null;
  balanceOrder: string | null;
  rate: string | null;
  finalRate: string | null;
  qualityClassId: string | null;
  importer: { name: string };
  vessel: { vesselName: string };
  dispatches: DispatchRow[];
};

export function PurchaseOrderDetailClient({
  order,
  qualityClasses,
}: {
  order: PurchaseOrderData;
  qualityClasses: QualityClassOpt[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [poNumber, setPoNumber] = useState(order.poNumber);
  const [orderDate, setOrderDate] = useState(
    order.orderDate
      ? new Date(order.orderDate).toISOString().slice(0, 10)
      : "",
  );
  const [quantity, setQuantity] = useState(order.quantity ?? "");
  const [rate, setRate] = useState(order.rate ?? "");
  const [qualityClassId, setQualityClassId] = useState(
    order.qualityClassId ?? "",
  );

  const rateBreakdown = useMemo(() => {
    if (rate === "") return null;
    return computePurchaseRateBreakdown(rate);
  }, [rate]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      if (order.orderType === OrderType.OPEN && !order.quantity) {
        await completeOpenPurchaseOrder(order.id, {
          quantity,
          rate: rate || null,
          qualityClassId: qualityClassId || null,
        });
        await updatePurchaseOrderFields(order.id, {
          poNumber,
          orderDate: orderDate || null,
        });
      } else {
        await updatePurchaseOrderFields(order.id, {
          poNumber,
          orderDate: orderDate || null,
          quantity: quantity || undefined,
          rate: rate === "" ? null : rate,
          qualityClassId: qualityClassId || null,
        });
      }
      setMessage("Purchase order updated.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDeleteDispatch(id: string) {
    if (!confirm("Delete this pending dispatch? Balances will be reversed.")) {
      return;
    }
    setError(null);
    try {
      await deleteDispatch(id);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onDeletePurchaseOrder() {
    if (!confirm("Delete this purchase order?")) return;
    setError(null);
    setMessage(null);
    setDeleting(true);
    try {
      await deletePurchaseOrder(order.id);
      router.push("/purchase-orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  const canCloseQuantity =
    order.quantity != null &&
    order.closingQuantity == null &&
    order.balanceOrder != null &&
    Number(order.balanceOrder) > 0;

  return (
    <div>
      <div className="mb-8 items-center gap-4">
        <h1 className="page-title mb-0">Purchase order {order.poNumber}</h1>
        <button
          type="button"
          className="btn btn-danger mt-3"
          onClick={onDeletePurchaseOrder}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete order"}
        </button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="mb-6 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div>
          <span className="text-neutral-500">Vendor:</span>{" "}
          {order.importer.name}
        </div>
        <div>
          <span className="text-neutral-500">Vessel:</span>{" "}
          {order.vessel.vesselName}
        </div>
        <div>
          <span className="text-neutral-500">Type:</span>{" "}
          {formatOrderType(order.orderType)}
        </div>
        <div>
          <span className="text-neutral-500">Status:</span>{" "}
          {formatOrderStatusForDisplay(order)}
        </div>
        <div>
          <span className="text-neutral-500">Dispatched:</span>{" "}
          {formatSaleOrderMt(order.dispatchedOrder)}
        </div>
        <div>
          <span className="text-neutral-500">Closing:</span>{" "}
          {formatSaleOrderMt(order.closingQuantity)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <span className="text-neutral-500">Balance:</span>{" "}
            {formatSaleOrderMt(displayOrderBalance(order))}
          </span>
          {canCloseQuantity && (
            <CloseQuantityButton
              orderId={order.id}
              kind="purchase"
              balanceMt={order.balanceOrder!}
            />
          )}
        </div>
      </div>

      <h2 className="mb-3 text-base font-semibold">
        {order.orderType === OrderType.OPEN && !order.quantity
          ? "Complete open purchase order"
          : "Edit purchase order fields"}
      </h2>
      <form onSubmit={onSave} className="mb-8 form-grid">
        <label>Purchase order number</label>
        <input
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="PO 0001"
        />
        <label>Order date</label>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
        />
        <label>Quantity</label>
        <div className="field-with-unit">
          <input
            required={order.orderType === OrderType.OPEN && !order.quantity}
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <span className="field-unit">MT</span>
        </div>
        <label>Basic rate</label>
        <div className="field-with-unit field-with-prefix">
          <span className="field-unit">Rs</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>
        {rateBreakdown != null ? (
          <RateBreakdownFields breakdown={rateBreakdown} />
        ) : (
          <>
            <label>Final rate</label>
            <div className="text-sm text-neutral-600">—</div>
          </>
        )}
        <label>Quality class</label>
        <QualityClassSelect
          value={qualityClassId}
          onChange={setQualityClassId}
          options={qualityClasses}
        />
        <div />
        <button type="submit" className="btn w-fit">
          Save purchase order
        </button>
      </form>

      <h2 className="mb-3 text-base font-semibold">Dispatches</h2>
      <div className="table-wrap">
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sale PO</th>
              <th className="num">Quantity</th>
              <th>Terms</th>
              <th className="num">Freight</th>
              <th>Lorry</th>
              <th>Transporter</th>
              <th className="num">Profit</th>
              <th>Receipt</th>
              <th>Soft copy</th>
              <th>Tally</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {order.dispatches.map((d) => (
              <tr key={d.id}>
                <td>{new Date(d.dispatchDate).toISOString().slice(0, 10)}</td>
                <td>
                  {d.order ? (
                    <Link href={`/orders/${d.order.id}`} className="font-medium">
                      {d.order.poNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="num">{formatSaleOrderMt(d.dispatchedQuantity)}</td>
                <td>{formatDispatchTerms(d.dispatchTerms)}</td>
                <td className="num">{formatRs(d.freight)}</td>
                <td>{formatLorryNumber(d.lorryNumber) ?? "—"}</td>
                <td>{d.transporter?.name ?? "—"}</td>
                <td className="num">{formatRs(d.lineProfit)}</td>
                <td>{d.receiptStatus}</td>
                <td>{d.softCopyStatus ? "yes" : "no"}</td>
                <td>{d.entryInTally ? "yes" : "no"}</td>
                <td>
                  {d.receiptStatus === "PENDING" && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => onDeleteDispatch(d.id)}
                      disabled={!d.canDelete}
                      title={d.canDelete ? undefined : DISPATCH_EDIT_LOCK_HINT}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {order.dispatches.length === 0 && (
              <tr>
                <td colSpan={12}>No dispatches yet.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
