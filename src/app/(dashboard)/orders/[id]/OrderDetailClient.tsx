"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { DispatchTerms, OrderType } from "@/generated/prisma";
import { completeOpenOrder, deleteDispatch } from "@/lib/actions/dispatch";
import { updateOrderFields } from "@/lib/actions/orders";
import { formatDispatchTerms } from "@/lib/domain/format";

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
  balanceOrder: string | null;
  gst: string | null;
  rate: string | null;
  creditDays: number | null;
  quality: string | null;
  area: string | null;
  customer: { name: string };
  orderBy: { name: string } | null;
  dispatches: DispatchRow[];
};

export function OrderDetailClient({ order }: { order: OrderData }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(order.quantity ?? "");
  const [rate, setRate] = useState(order.rate ?? "");
  const [creditDays, setCreditDays] = useState(
    order.creditDays != null ? String(order.creditDays) : "",
  );
  const [quality, setQuality] = useState(order.quality ?? "");
  const [area, setArea] = useState(order.area ?? "");

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
          quality: quality || null,
          area: area || null,
        });
      } else {
        await updateOrderFields(order.id, {
          quantity: quantity || undefined,
          rate: rate === "" ? null : rate,
          creditDays: creditDays === "" ? null : Number(creditDays),
          quality: quality || null,
          area: area || null,
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
          <span className="text-neutral-500">Type:</span> {order.orderType}
        </div>
        <div>
          <span className="text-neutral-500">Status:</span> {order.orderStatus}
        </div>
        <div>
          <span className="text-neutral-500">Order by:</span>{" "}
          {order.orderBy?.name ?? "—"}
        </div>
        <div>
          <span className="text-neutral-500">Dispatched (MT):</span>{" "}
          {order.dispatchedOrder}
        </div>
        <div>
          <span className="text-neutral-500">Balance (MT):</span>{" "}
          {order.balanceOrder != null ? order.balanceOrder : "—"}
        </div>
        <div>
          <span className="text-neutral-500">GST (Rs):</span>{" "}
          {order.gst != null ? order.gst : "—"}
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
        <label>Rate</label>
        <div className="field-with-unit">
          <input
            type="number"
            step="any"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
          <span className="field-unit">Rs</span>
        </div>
        <label>Credit days</label>
        <input
          type="number"
          min="0"
          value={creditDays}
          onChange={(e) => setCreditDays(e.target.value)}
        />
        <label>Quality</label>
        <input value={quality} onChange={(e) => setQuality(e.target.value)} />
        <label>Area</label>
        <input value={area} onChange={(e) => setArea(e.target.value)} />
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
              <th>Qty (MT)</th>
              <th>Terms</th>
              <th>Freight (Rs/MT)</th>
              <th>Lorry</th>
              <th>Transporter</th>
              <th>Profit (Rs)</th>
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
                <td>{d.dispatchedQuantity}</td>
                <td>{formatDispatchTerms(d.dispatchTerms)}</td>
                <td>{d.freight != null ? d.freight : "—"}</td>
                <td>{d.lorryNumber ?? "—"}</td>
                <td>{d.transporter?.name ?? "—"}</td>
                <td>{d.lineProfit != null ? d.lineProfit : "—"}</td>
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
