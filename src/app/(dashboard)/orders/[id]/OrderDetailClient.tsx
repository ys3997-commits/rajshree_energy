"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { CustomerCategory, DispatchTerms, OrderType } from "@/generated/prisma";
import { completeOpenOrder, deleteDispatch } from "@/lib/actions/dispatch";
import { updateOrderFields } from "@/lib/actions/orders";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
import { computeSaleRateBreakdown } from "@/lib/domain/saleRate";
import { formatDispatchTerms, formatCreditPeriod, formatLorryNumber, formatMt, formatOrderStatusForDisplay, formatOrderType, formatRs, displayOrderBalance } from "@/lib/domain/format";
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
  purchasePoNumber: string;
  lineProfit: string | null;
  purchaseOrder: {
    poNumber: string;
    importer: { name: string } | null;
    vessel: { vesselName: string } | null;
  } | null;
  transporter: { name: string } | null;
};

type OrderData = {
  id: string;
  poNumber: string;
  orderType: OrderType;
  orderStatus: string;
  orderDate: string | null;
  quantity: string | null;
  dispatchedOrder: string;
  closingQuantity: string | null;
  balanceOrder: string | null;
  gst: string | null;
  rate: string | null;
  finalRate: string | null;
  creditDays: number | null;
  qualityClassId: string | null;
  portId: string | null;
  customer: { name: string; category: CustomerCategory };
  dispatches: DispatchRow[];
};

type QualityClassOpt = {
  id: string;
  domestic: boolean;
  origin: { name: string };
  qualityOption: { name: string };
};

type PortOpt = { id: string; name: string };

export function OrderDetailClient({
  order,
  qualityClasses,
  ports,
}: {
  order: OrderData;
  qualityClasses: QualityClassOpt[];
  ports: PortOpt[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [poNumber, setPoNumber] = useState(order.poNumber);
  const [quantity, setQuantity] = useState(
    order.quantity ??
      (order.orderType === OrderType.OPEN ? order.dispatchedOrder : ""),
  );  const [rate, setRate] = useState(order.rate ?? "");
  const [creditDays, setCreditDays] = useState(
    order.creditDays != null ? String(order.creditDays) : "",
  );
  const [qualityClassId, setQualityClassId] = useState(
    order.qualityClassId ?? "",
  );
  const [portId, setPortId] = useState(order.portId ?? "");

  const rateBreakdown = useMemo(() => {
    if (rate === "") return null;
    return computeSaleRateBreakdown(rate, order.customer.category);
  }, [rate, order.customer.category]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      if (order.orderType === OrderType.OPEN && !order.quantity) {
        await completeOpenOrder(order.id, {
          quantity,
          rate: rate || null,
          creditDays: creditDays === "" ? null : Number(creditDays),
          qualityClassId: qualityClassId || null,
          portId: portId || null,
        });
        if (poNumber !== order.poNumber) {
          await updateOrderFields(order.id, { poNumber });
        }
      } else {
        await updateOrderFields(order.id, {
          poNumber,
          quantity: quantity || undefined,
          rate: rate === "" ? null : rate,
          creditDays: creditDays === "" ? null : Number(creditDays),
          qualityClassId: qualityClassId || null,
          portId: portId || null,
        });
      }
      setMessage("Order updated.");
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

  const canCloseQuantity =
    order.quantity != null &&
    order.closingQuantity == null &&
    order.balanceOrder != null &&
    Number(order.balanceOrder) > 0;

  return (
    <div>
      <div className="mb-8 items-center gap-4">
        <h1 className="page-title mb-0">Order {order.poNumber}</h1>
      </div>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="mb-6 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div>
          <span className="text-neutral-500">Customer:</span>{" "}
          {order.customer.name}
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
          <span className="text-neutral-500">Dispatched (MT):</span>{" "}
          {formatMt(order.dispatchedOrder)}
        </div>
        <div>
          <span className="text-neutral-500">Closing (MT):</span>{" "}
          {formatMt(order.closingQuantity)}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <span className="text-neutral-500">Balance (MT):</span>{" "}
            {formatMt(displayOrderBalance(order))}
          </span>
          {canCloseQuantity && (
            <CloseQuantityButton
              orderId={order.id}
              kind="sale"
              balanceMt={order.balanceOrder!}
            />
          )}
        </div>
        <div>
          <span className="text-neutral-500">GST:</span>{" "}
          {order.gst != null ? formatRs(order.gst) : "—"}
        </div>
        <div>
          <span className="text-neutral-500">Final rate:</span>{" "}
          {order.finalRate != null ? formatRs(order.finalRate) : "—"}
        </div>
        <div>
          <span className="text-neutral-500">Order date:</span>{" "}
          {order.orderDate
            ? new Date(order.orderDate).toISOString().slice(0, 10)
            : "—"}
        </div>
      </div>

      <h2 className="mb-3 text-base font-semibold">
        {order.orderType === OrderType.OPEN && !order.quantity
          ? "Complete open order"
          : "Edit order fields"}
      </h2>
      <form onSubmit={onSave} className="mb-8 form-grid">
        <label>Sale order number</label>
        <input
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="SO 0001"
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
        {rateBreakdown != null && (
          <RateBreakdownFields breakdown={rateBreakdown} />
        )}
        <label>Credit period</label>
        <div className="field-with-unit">
          <input
            type="number"
            min="0"
            value={creditDays}
            onChange={(e) => setCreditDays(e.target.value)}
          />
          <span className="field-unit">days</span>
        </div>
        <label>Quality class</label>
        <QualityClassSelect
          value={qualityClassId}
          onChange={setQualityClassId}
          options={qualityClasses}
        />
        <label>Port</label>
        <select value={portId} onChange={(e) => setPortId(e.target.value)}>
          <option value="">Select</option>
          {ports.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div />
        <button type="submit" className="btn w-fit">
          Save order
        </button>
      </form>

      <h2 className="mb-3 text-base font-semibold">Dispatches</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Purchase PO</th>
              <th className="num">Qty (MT)</th>
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
                  {d.purchaseOrder
                    ? `${d.purchaseOrder.poNumber} — ${d.purchaseOrder.importer?.name ?? "?"} — ${d.purchaseOrder.vessel?.vesselName ?? "?"}`
                    : d.purchasePoNumber}
                </td>
                <td className="num">{formatMt(d.dispatchedQuantity)}</td>
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
        </table>
      </div>
    </div>
  );
}
