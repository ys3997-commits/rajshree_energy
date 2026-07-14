"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { DispatchTerms, OrderType } from "@/generated/prisma";
import { deleteDispatch } from "@/lib/actions/dispatch";
import {
  completeOpenPurchaseOrder,
  updatePurchaseOrderFields,
} from "@/lib/actions/purchaseOrders";
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
  lineProfit: string | null;
  order: { id: string; poNumber: string } | null;
  transporter: { name: string } | null;
};

type PurchaseOrderData = {
  id: string;
  poNumber: string;
  orderType: OrderType;
  orderStatus: string;
  orderDate: string | null;
  quantity: string | null;
  dispatchedOrder: string;
  balanceOrder: string | null;
  rate: string | null;
  quality: string | null;
  importer: { name: string };
  vessel: { vesselName: string };
  orderBy: { name: string } | null;
  dispatches: DispatchRow[];
};

export function PurchaseOrderDetailClient({
  order,
}: {
  order: PurchaseOrderData;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(order.quantity ?? "");
  const [rate, setRate] = useState(order.rate ?? "");
  const [quality, setQuality] = useState(order.quality ?? "");

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      if (order.orderType === OrderType.OPEN && !order.quantity) {
        await completeOpenPurchaseOrder(order.id, {
          quantity,
          rate: rate || null,
          quality: quality || null,
        });
      } else {
        await updatePurchaseOrderFields(order.id, {
          quantity: quantity || undefined,
          rate: rate === "" ? null : rate,
          quality: quality || null,
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

  return (
    <div>
      <div className="mb-8 items-center gap-4">
        <h1 className="page-title mb-0">Purchase order {order.poNumber}</h1>
      </div>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="mb-6 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div>
          <span className="text-neutral-500">Importer:</span>{" "}
          {order.importer.name}
        </div>
        <div>
          <span className="text-neutral-500">Vessel:</span>{" "}
          {order.vessel.vesselName}
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
          <span className="text-neutral-500">Order date:</span>{" "}
          {order.orderDate
            ? new Date(order.orderDate).toISOString().slice(0, 10)
            : "—"}
        </div>
      </div>

      <h2 className="mb-3 text-base font-semibold">
        {order.orderType === OrderType.OPEN && !order.quantity
          ? "Complete open purchase order"
          : "Edit purchase order fields"}
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
        <label>Rate (cost)</label>
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
        <label>Quality</label>
        <input value={quality} onChange={(e) => setQuality(e.target.value)} />
        <div />
        <button type="submit" className="btn w-fit">
          Save purchase order
        </button>
      </form>

      <h2 className="mb-3 text-base font-semibold">Dispatches</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sale PO</th>
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
                  {d.order ? (
                    <Link href={`/orders/${d.order.id}`} className="font-medium">
                      {d.order.poNumber}
                    </Link>
                  ) : (
                    "—"
                  )}
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
