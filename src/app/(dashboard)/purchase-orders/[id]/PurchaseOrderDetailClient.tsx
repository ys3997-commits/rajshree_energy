"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { OrderType } from "@/generated/prisma";
import {
  completeOpenPurchaseOrder,
  updatePurchaseOrderFields,
} from "@/lib/actions/purchaseOrders";
import { CloseQuantityButton } from "@/components/CloseQuantityButton";
import { computePurchaseRateBreakdown } from "@/lib/domain/purchaseRate";
import {
  formatOrderStatusForDisplay,
  formatOrderType,
  formatSaleOrderMt,
  displayOrderBalance,
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
  saleOrderId: string | null;
  salePo: string;
  saleInvoice: string;
  customerName: string;
  basicPrice: string;
  gst: string;
  tcs: string;
  invoiceAmount: string;
  deliveryTerms: string;
  transporterName: string;
  freightPmt: string;
  freightAmount: string;
};

type QualityClassOpt = {
  id: string;
  domestic: boolean;
  origin: { name: string };
  qualityOption: { name: string };
};

type VendorOpt = { id: string; name: string };

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
  importerId: string;
  importer: { name: string };
  vessel: { vesselName: string };
  dispatches: DispatchRow[];
};

export function PurchaseOrderDetailClient({
  order,
  qualityClasses,
  vendors,
  canEdit,
}: {
  order: PurchaseOrderData;
  qualityClasses: QualityClassOpt[];
  vendors: VendorOpt[];
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
  const [importerId, setImporterId] = useState(order.importerId);
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
    if (!canEdit) return;
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
          importerId,
        });
      } else {
        await updatePurchaseOrderFields(order.id, {
          poNumber,
          orderDate: orderDate || null,
          importerId,
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

  const canCloseQuantity =
    formatOrderStatusForDisplay(order) === "Running";

  return (
    <div>
      <h1 className="page-title">Purchase order {order.poNumber}</h1>

      {error && <div className="error-box">{error}</div>}
      {message && <div className="success-box">{message}</div>}

      <div className="mb-6 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
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
              balanceMt={String(
                displayOrderBalance(order) ?? order.balanceOrder ?? "0",
              )}
            />
          )}
        </div>
      </div>

      <h2 className="mb-3 text-base font-semibold">
        {canEdit
          ? order.orderType === OrderType.OPEN && !order.quantity
            ? "Complete open purchase order"
            : "Edit purchase order fields"
          : "Purchase order fields"}
      </h2>
      <form onSubmit={onSave} className="mb-8 form-grid">
        <label>Purchase Order Number</label>
        <input
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="PO 0001"
          disabled={!canEdit}
        />
        <label>Order Date</label>
        <input
          type="date"
          value={orderDate}
          onChange={(e) => setOrderDate(e.target.value)}
          disabled={!canEdit}
        />
        <label>Vendor</label>
        {canEdit ? (
          <select
            required
            value={importerId}
            onChange={(e) => setImporterId(e.target.value)}
          >
            <option value="">Select</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        ) : (
          <input value={order.importer.name} disabled readOnly />
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
        {rateBreakdown != null ? (
          <RateBreakdownFields breakdown={rateBreakdown} />
        ) : (
          <>
            <label>Final Rate</label>
            <div className="text-sm text-neutral-600">—</div>
          </>
        )}
        <label>Quality Class</label>
        <QualityClassSelect
          value={qualityClassId}
          onChange={setQualityClassId}
          options={qualityClasses}
          disabled={!canEdit}
        />
        {canEdit && (
          <>
            <div />
            <button type="submit" className="btn w-fit">
              Save purchase order
            </button>
          </>
        )}
      </form>

      <h2 className="mb-3 text-base font-semibold">Dispatches</h2>
      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
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
                  SO
                  <br />
                  no
                </th>
                <th className="col-wrap-head">
                  Sale
                  <br />
                  invoice
                </th>
                <th className="col-wrap-head">
                  Customer
                  <br />
                  name
                </th>
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
                <th className="col-wrap-head">
                  Delivery
                  <br />
                  terms
                </th>
                <th className="col-wrap-head">
                  Transporter
                  <br />
                  name
                </th>
                <th className="num col-wrap-head">
                  Freight
                  <br />
                  PMT
                </th>
                <th className="num col-wrap-head">
                  Freight
                  <br />
                  amount
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
                    {d.saleOrderId ? (
                      <Link href={`/orders/${d.saleOrderId}`} className="font-medium">
                        {d.salePo}
                      </Link>
                    ) : (
                      d.salePo
                    )}
                  </td>
                  <td>{d.saleInvoice}</td>
                  <td>{d.customerName}</td>
                  <td className="num">{d.basicPrice}</td>
                  <td className="num">{d.gst}</td>
                  <td className="num">{d.tcs}</td>
                  <td className="num">{d.invoiceAmount}</td>
                  <td>{d.deliveryTerms}</td>
                  <td>{d.transporterName}</td>
                  <td className="num">{d.freightPmt}</td>
                  <td className="num">{d.freightAmount}</td>
                </tr>
              ))}
              {order.dispatches.length === 0 && (
                <tr>
                  <td colSpan={17}>No dispatches yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
