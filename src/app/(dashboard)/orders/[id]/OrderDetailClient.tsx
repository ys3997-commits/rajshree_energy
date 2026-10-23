"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { CustomerCategory, DispatchTerms, OrderType } from "@/generated/prisma";
import { completeOpenOrder } from "@/lib/actions/dispatch";
import { updateOrderFields } from "@/lib/actions/orders";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
import { computeSaleRateBreakdown } from "@/lib/domain/saleRate";
import {
  formatDispatchTerms,
  formatOrderStatusForDisplay,
  formatOrderType,
  formatRs,
  displayOrderBalance,
  formatSaleOrderMt,
} from "@/lib/domain/format";
import { RateBreakdownFields } from "@/components/RateBreakdownFields";
import { QualityClassSelect } from "@/components/QualityClassSelect";

type DispatchRow = {
  id: string;
  dispatchNumber: string;
  date: string;
  lorryNumber: string;
  weight: string;
  vesselName: string;
  quality: string;
  purchaseOrderId: string | null;
  purchasePo: string;
  purchaseInvoice: string;
  vendor: string;
  basicPrice: string;
  gst: string;
  tcs: string;
  invoiceAmount: string;
};

type OrderData = {
  id: string;
  poNumber: string;
  orderType: OrderType;
  orderStatus: string;
  orderDate: string | null;
  quantity: string | null;
  numberOfLorries: number | null;
  dispatchedOrder: string;
  closingQuantity: string | null;
  balanceOrder: string | null;
  gst: string | null;
  rate: string | null;
  finalRate: string | null;
  creditDays: number | null;
  qualityClassId: string | null;
  portId: string | null;
  deliveryTerms: DispatchTerms | null;
  customerId: string;
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

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
};

export function OrderDetailClient({
  order,
  qualityClasses,
  ports,
  customers,
  canEdit,
}: {
  order: OrderData;
  qualityClasses: QualityClassOpt[];
  ports: PortOpt[];
  customers: CustomerOpt[];
  canEdit: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [poNumber, setPoNumber] = useState(order.poNumber);
  const [orderDate, setOrderDate] = useState(
    order.orderDate
      ? new Date(order.orderDate).toISOString().slice(0, 10)
      : "",
  );
  const [customerId, setCustomerId] = useState(order.customerId);
  const [quantity, setQuantity] = useState(
    order.quantity ??
      (order.orderType === OrderType.OPEN ? order.dispatchedOrder : ""),
  );
  const [numberOfLorries, setNumberOfLorries] = useState(
    order.numberOfLorries != null ? String(order.numberOfLorries) : "",
  );
  const [closingQuantity, setClosingQuantity] = useState(
    order.closingQuantity ?? "",
  );
  const [rate, setRate] = useState(order.rate ?? "");
  const [creditDays, setCreditDays] = useState(
    order.creditDays != null ? String(order.creditDays) : "",
  );
  const [qualityClassId, setQualityClassId] = useState(
    order.qualityClassId ?? "",
  );
  const [portId, setPortId] = useState(order.portId ?? "");
  const [deliveryTerms, setDeliveryTerms] = useState<DispatchTerms | null>(
    order.deliveryTerms,
  );

  const customerCategory = useMemo(() => {
    return (
      customers.find((customer) => customer.id === customerId)?.category ??
      order.customer.category
    );
  }, [customers, customerId, order.customer.category]);

  const rateBreakdown = useMemo(() => {
    if (rate === "") return null;
    return computeSaleRateBreakdown(rate, customerCategory);
  }, [rate, customerCategory]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!canEdit) return;
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
        await updateOrderFields(order.id, {
          poNumber,
          customerId,
          orderDate: orderDate || null,
          deliveryTerms,
          numberOfLorries:
            numberOfLorries === "" ? null : Number(numberOfLorries),
          closingQuantity: closingQuantity === "" ? null : closingQuantity,
        });
      } else {
        await updateOrderFields(order.id, {
          poNumber,
          customerId,
          orderDate: orderDate || null,
          quantity: quantity || undefined,
          rate: rate === "" ? null : rate,
          creditDays: creditDays === "" ? null : Number(creditDays),
          qualityClassId: qualityClassId || null,
          portId: portId || null,
          deliveryTerms,
          numberOfLorries:
            numberOfLorries === "" ? null : Number(numberOfLorries),
          closingQuantity: closingQuantity === "" ? null : closingQuantity,
        });
      }
      setMessage("Order updated.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  const canCloseQuantity = formatOrderStatusForDisplay(order) === "Running";

  return (
    <div>
      <h1 className="page-title">Order {order.poNumber}</h1>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="mb-6 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <span className="text-neutral-500">Customer:</span>{" "}
          {order.customer.name}
        </div>
        <div>
          <span className="text-neutral-500">Type:</span>{" "}
          {formatOrderType(order.orderType)}
        </div>
        <div>
          <span className="text-neutral-500">Delivery terms:</span>{" "}
          {formatDispatchTerms(deliveryTerms)}
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
              kind="sale"
              balanceMt={String(
                displayOrderBalance(order) ?? order.balanceOrder ?? "0",
              )}
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
      </div>

      <h2 className="mb-3 text-base font-semibold">
        {canEdit
          ? order.orderType === OrderType.OPEN && !order.quantity
            ? "Complete open order"
            : "Edit order fields"
          : "Order fields"}
      </h2>
      <form onSubmit={onSave} className="mb-8 form-grid">
        <label>Sale Order Number</label>
        <input
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="SO 0001"
          disabled={!canEdit}
        />
        <label>Order Date</label>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          disabled={!canEdit}
        />
        <label>Customer</label>
        {canEdit ? (
          <select
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            <option value="">Select</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        ) : (
          <input value={order.customer.name} disabled readOnly />
        )}
        <label>Quantity</label>
        <div className="field-with-unit">
          <input
            required={order.orderType === OrderType.OPEN && !order.quantity}
            type="number"
            step="any"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={!canEdit}
          />
          <span className="field-unit">MT</span>
        </div>
        <label>Number of Lorries</label>
        <input
          type="number"
          min="0"
          step="1"
          value={numberOfLorries}
          onChange={(e) => setNumberOfLorries(e.target.value)}
          placeholder="0"
          disabled={!canEdit}
        />
        <label>Basic Rate</label>
        <div className="field-with-unit field-with-prefix">
          <span className="field-unit">Rs</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            disabled={!canEdit}
          />
        </div>
        {rateBreakdown != null && (
          <RateBreakdownFields breakdown={rateBreakdown} />
        )}
        <label>Credit Period</label>
        <div className="field-with-unit">
          <input
            type="number"
            min="0"
            value={creditDays}
            onChange={(e) => setCreditDays(e.target.value)}
            disabled={!canEdit}
          />
          <span className="field-unit">days</span>
        </div>
        <label>Quality Class</label>
        <QualityClassSelect
          value={qualityClassId}
          onChange={setQualityClassId}
          options={qualityClasses}
          disabled={!canEdit}
        />
        <label>Port</label>
        <select
          value={portId}
          onChange={(e) => setPortId(e.target.value)}
          disabled={!canEdit}
        >
          <option value="">Select</option>
          {ports.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label>Delivery Terms</label>
        <div
          className="segment-control"
          role="radiogroup"
          aria-label="Delivery terms"
        >
          <button
            type="button"
            role="radio"
            aria-checked={deliveryTerms === DispatchTerms.FOR}
            className={`segment-option${deliveryTerms === DispatchTerms.FOR ? " segment-option-selected" : ""}`}
            onClick={() => setDeliveryTerms(DispatchTerms.FOR)}
            disabled={!canEdit}
          >
            FOR
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={deliveryTerms === DispatchTerms.EX_PORT}
            className={`segment-option${deliveryTerms === DispatchTerms.EX_PORT ? " segment-option-selected" : ""}`}
            onClick={() => setDeliveryTerms(DispatchTerms.EX_PORT)}
            disabled={!canEdit}
          >
            Ex-Port
          </button>
        </div>
        <label>Closing Quantity</label>
        <div className="field-with-unit">
          <input
            type="number"
            step="any"
            min="0"
            value={closingQuantity}
            onChange={(e) => setClosingQuantity(e.target.value)}
            placeholder="0"
            disabled={!canEdit}
          />
          <span className="field-unit">MT</span>
        </div>
        {canEdit && (
          <>
            <div />
            <button type="submit" className="btn w-fit">
              Save order
            </button>
          </>
        )}
      </form>

      <h2 className="mb-3 text-base font-semibold">Dispatches</h2>
      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data detail-dispatch-table">
            <thead>
              <tr>
                <th className="col-wrap-head">
                  Dispatch
                  <br />
                  no
                </th>
                <th>Date</th>
                <th className="col-wrap-head">
                  Lorry
                  <br />
                  no
                </th>
                <th className="num">Weight</th>
                <th className="col-wrap-head">
                  Vessel
                  <br />
                  name
                </th>
                <th>Quality</th>
                <th className="col-wrap-head">
                  PO
                  <br />
                  no
                </th>
                <th className="col-wrap-head">
                  Purchase
                  <br />
                  invoice
                </th>
                <th>Vendor</th>
                <th className="num col-wrap-head">
                  Basic
                  <br />
                  price
                </th>
                <th className="num">GST</th>
                <th className="num">TCS</th>
                <th className="num col-wrap-head">
                  Invoice
                  <br />
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.dispatches.map((d) => (
                <tr key={d.id}>
                  <td>{d.dispatchNumber}</td>
                  <td>{d.date}</td>
                  <td>{d.lorryNumber}</td>
                  <td className="num">{d.weight}</td>
                  <td>{d.vesselName}</td>
                  <td>{d.quality}</td>
                  <td>
                    {d.purchaseOrderId ? (
                      <Link
                        href={`/purchase-orders/${d.purchaseOrderId}`}
                        className="font-medium"
                      >
                        {d.purchasePo}
                      </Link>
                    ) : (
                      d.purchasePo
                    )}
                  </td>
                  <td>{d.purchaseInvoice}</td>
                  <td>{d.vendor}</td>
                  <td className="num">{d.basicPrice}</td>
                  <td className="num">{d.gst}</td>
                  <td className="num">{d.tcs}</td>
                  <td className="num">{d.invoiceAmount}</td>
                </tr>
              ))}
              {order.dispatches.length === 0 && (
                <tr>
                  <td colSpan={13}>No dispatches yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
