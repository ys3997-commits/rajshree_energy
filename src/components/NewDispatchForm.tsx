"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerCategory, DispatchTerms } from "@/generated/prisma";
import {
  createDispatch,
  createOpenOrderDispatch,
} from "@/lib/actions/dispatch";
import {
  formatQualityClass,
  formatMt,
  formatRateBreakdownLine,
  normalizeLorryNumber,
} from "@/lib/domain/format";
import { computePurchaseRateBreakdown } from "@/lib/domain/purchaseRate";
import { computeSaleRateBreakdown } from "@/lib/domain/saleRate";

type OrderOpt = {
  poNumber: string;
  balanceOrder: string | null;
  rate: string | null;
  customer: { name: string; category: CustomerCategory } | null;
};

type QualityClassOpt = {
  domestic: boolean;
  origin: { name: string };
  qualityOption: { name: string };
};

type PurchaseOpt = {
  poNumber: string;
  balanceOrder: string | null;
  rate: string | null;
  importer: { name: string } | null;
  vessel: { vesselName: string } | null;
  qualityClass: QualityClassOpt | null;
};

type Opt = { id: string; name: string };

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
};

type VesselOpt = {
  id: string;
  vesselName: string;
};

export function NewDispatchForm({
  orders,
  purchaseOrders,
  transporters,
  customers,
  vessels,
  suggestedPo,
  suggestedPurchasePo,
  suggestedDispatchNumber,
  onCancel,
  onSuccess,
}: {
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  transporters: Opt[];
  customers: CustomerOpt[];
  vessels: VesselOpt[];
  suggestedPo: string;
  suggestedPurchasePo: string;
  suggestedDispatchNumber: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "open">("existing");
  const [purchaseMode, setPurchaseMode] = useState<"existing" | "open">(
    "existing",
  );
  const [dispatchNumber, setDispatchNumber] = useState(suggestedDispatchNumber);
  const [poNumber, setPoNumber] = useState("");
  const [openPoNumber, setOpenPoNumber] = useState(suggestedPo);
  const [customerId, setCustomerId] = useState("");
  const [saleRate, setSaleRate] = useState("");
  const [purchasePoNumber, setPurchasePoNumber] = useState("");
  const [openPurchasePoNumber, setOpenPurchasePoNumber] =
    useState(suggestedPurchasePo);
  const [vendorId, setVendorId] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [dispatchedQuantity, setDispatchedQuantity] = useState("");
  const [dispatchTerms, setDispatchTerms] = useState<DispatchTerms>(
    DispatchTerms.EX_PORT,
  );
  const [lorryNumber, setLorryNumber] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [freight, setFreight] = useState("");
  const [saleInvoiceNumber, setSaleInvoiceNumber] = useState("");
  const [purchaseInvoiceNumber, setPurchaseInvoiceNumber] = useState("");
  const [dispatchDate, setDispatchDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.poNumber === poNumber) ?? null,
    [orders, poNumber],
  );
  const selectedPurchase = useMemo(
    () =>
      purchaseOrders.find((p) => p.poNumber === purchasePoNumber) ?? null,
    [purchaseOrders, purchasePoNumber],
  );

  const purchaseRateBreakdown = useMemo(
    () => computePurchaseRateBreakdown(purchaseRate),
    [purchaseRate],
  );

  const selectedPurchaseRateBreakdown = useMemo(
    () => computePurchaseRateBreakdown(selectedPurchase?.rate),
    [selectedPurchase?.rate],
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  );

  const saleRateBreakdown = useMemo(
    () => computeSaleRateBreakdown(saleRate, selectedCustomer?.category),
    [saleRate, selectedCustomer?.category],
  );

  const selectedSaleRateBreakdown = useMemo(
    () =>
      computeSaleRateBreakdown(
        selectedOrder?.rate,
        selectedOrder?.customer?.category,
      ),
    [selectedOrder?.rate, selectedOrder?.customer?.category],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const openPurchase =
        purchaseMode === "open"
          ? {
              poNumber: openPurchasePoNumber,
              importerId: vendorId,
              vesselId,
              rate: purchaseRate.trim() || null,
            }
          : undefined;
      const existingPurchasePo =
        purchaseMode === "existing" ? purchasePoNumber : undefined;

      if (purchaseMode === "existing" && !purchasePoNumber) {
        throw new Error("Select a purchase order");
      }
      if (purchaseMode === "open") {
        if (!openPurchasePoNumber.trim()) {
          throw new Error("Purchase PO number is required");
        }
        if (!vendorId) throw new Error("Vendor is required");
        if (!vesselId) throw new Error("Vessel is required");
      }

      const shared = {
        dispatchNumber,
        purchasePoNumber: existingPurchasePo,
        openPurchase,
        dispatchDate,
        dispatchedQuantity,
        dispatchTerms,
        lorryNumber: lorryNumber
          ? (normalizeLorryNumber(lorryNumber) ?? null)
          : null,
        transporterId: transporterId || null,
        freight: freight || null,
        saleInvoiceNumber: saleInvoiceNumber || null,
        purchaseInvoiceNumber: purchaseInvoiceNumber || null,
      };

      if (mode === "open") {
        if (!customerId) throw new Error("Customer is required");
        await createOpenOrderDispatch({
          poNumber: openPoNumber,
          customerId,
          rate: saleRate.trim() || null,
          ...shared,
        });
      } else {
        if (!poNumber) throw new Error("Select an existing sale PO");
        await createDispatch({
          poNumber,
          ...shared,
        });
      }
      if (onSuccess) {
        onSuccess();
        router.refresh();
      } else {
        router.push("/dispatches");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="form-grid form-grid-plain">
        <label>Dispatch no</label>
        <input
          required
          value={dispatchNumber}
          onChange={(e) => setDispatchNumber(e.target.value.toUpperCase())}
          placeholder="DN 0001"
        />

        <label>Dispatch date</label>
        <input
          required
          type="date"
          value={dispatchDate}
          onChange={(e) => setDispatchDate(e.target.value)}
        />

        <label>Lorry number</label>
        <input
          value={lorryNumber}
          onChange={(e) => setLorryNumber(e.target.value.toUpperCase())}
          onBlur={() => {
            if (!lorryNumber.trim()) return;
            try {
              const formatted = normalizeLorryNumber(lorryNumber);
              if (formatted) setLorryNumber(formatted);
            } catch {
              // Keep typed value; submit will surface the error.
            }
          }}
        />

        <label>Dispatched quantity</label>
        <div className="field-with-unit">
          <input
            required
            type="number"
            step="any"
            min="0.0001"
            value={dispatchedQuantity}
            onChange={(e) => setDispatchedQuantity(e.target.value)}
          />
          <span className="field-unit">MT</span>
        </div>

        <div
          className="option-cards"
          role="radiogroup"
          aria-label="Purchase order type"
          style={{ gridColumn: "1 / -1" }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={purchaseMode === "existing"}
            className={`option-card${purchaseMode === "existing" ? " option-card-selected" : ""}`}
            onClick={() => setPurchaseMode("existing")}
          >
            <span className="option-card-title">Existing purchase PO</span>
            <span className="option-card-desc">
              Link dispatch to a purchase order already on file
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={purchaseMode === "open"}
            className={`option-card${purchaseMode === "open" ? " option-card-selected" : ""}`}
            onClick={() => setPurchaseMode("open")}
          >
            <span className="option-card-title">Open purchase order</span>
            <span className="option-card-desc">
              Create a new open purchase order, then dispatch from it
            </span>
          </button>
        </div>

        {purchaseMode === "existing" ? (
          <>
            <label>Purchase order</label>
            <select
              required
              value={purchasePoNumber}
              onChange={(e) => setPurchasePoNumber(e.target.value)}
            >
              <option value="">Select</option>
              {purchaseOrders.map((p) => (
                <option key={p.poNumber} value={p.poNumber}>
                  {p.poNumber} — {p.importer?.name ?? "?"} —{" "}
                  {p.vessel?.vesselName ?? "?"} (bal{" "}
                  {p.balanceOrder != null ? formatMt(p.balanceOrder) : "n/a"})
                </option>
              ))}
            </select>
            {selectedPurchase && (
              <>
                <label>Purchase balance</label>
                <div className="text-sm">
                  {selectedPurchase.balanceOrder != null
                    ? formatMt(selectedPurchase.balanceOrder)
                    : "—"}
                </div>
                <label>Vessel</label>
                <div className="text-sm">
                  {selectedPurchase.vessel?.vesselName ?? "—"}
                </div>
                <label>Quality</label>
                <div className="text-sm">
                  {formatQualityClass(selectedPurchase.qualityClass)}
                </div>
                <label>Rate breakdown</label>
                <div className="text-sm font-medium">
                  {selectedPurchaseRateBreakdown != null
                    ? formatRateBreakdownLine(selectedPurchaseRateBreakdown)
                    : "—"}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <label>Purchase order number</label>
            <input
              required
              value={openPurchasePoNumber}
              onChange={(e) => setOpenPurchasePoNumber(e.target.value)}
              placeholder="PO 0001"
            />
            <label>Vendor</label>
            <select
              required
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">Select</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label>Vessel</label>
            <select
              required
              value={vesselId}
              onChange={(e) => setVesselId(e.target.value)}
            >
              <option value="">Select</option>
              {vessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vesselName}
                </option>
              ))}
            </select>
            <label>Basic rate</label>
            <div className="field-with-unit field-with-prefix">
              <span className="field-unit">Rs</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchaseRate}
                onChange={(e) => setPurchaseRate(e.target.value)}
              />
            </div>
            {purchaseRateBreakdown != null && (
              <>
                <label>Rate breakdown</label>
                <div className="text-sm font-medium">
                  {formatRateBreakdownLine(purchaseRateBreakdown)}
                </div>
              </>
            )}
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              Creates an OPEN purchase order with quantity null, then the
              dispatch against it.
            </p>
          </>
        )}

        <div
          className="option-cards"
          role="radiogroup"
          aria-label="Sale order type"
          style={{ gridColumn: "1 / -1" }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={mode === "existing"}
            className={`option-card${mode === "existing" ? " option-card-selected" : ""}`}
            onClick={() => setMode("existing")}
          >
            <span className="option-card-title">Existing sale PO</span>
            <span className="option-card-desc">
              Link dispatch to a sale order already on file
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "open"}
            className={`option-card${mode === "open" ? " option-card-selected" : ""}`}
            onClick={() => setMode("open")}
          >
            <span className="option-card-title">Open sale order</span>
            <span className="option-card-desc">
              Create a new open order, then dispatch against purchase stock
            </span>
          </button>
        </div>

        {mode === "existing" ? (
          <>
            <label>Sale order number</label>
            <select
              required
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            >
              <option value="">Select</option>
              {orders.map((o) => (
                <option key={o.poNumber} value={o.poNumber}>
                  {o.poNumber} — {o.customer?.name} (bal{" "}
                  {o.balanceOrder != null ? formatMt(o.balanceOrder) : "n/a"})
                </option>
              ))}
            </select>
            {selectedOrder && (
              <>
                <label>Sale balance</label>
                <div className="text-sm">
                  {selectedOrder.balanceOrder != null
                    ? formatMt(selectedOrder.balanceOrder)
                    : "—"}
                </div>
                <label>Rate breakdown</label>
                <div className="text-sm font-medium">
                  {selectedSaleRateBreakdown != null
                    ? formatRateBreakdownLine(selectedSaleRateBreakdown)
                    : "—"}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <label>Sale order number</label>
            <input
              required
              value={openPoNumber}
              onChange={(e) => setOpenPoNumber(e.target.value)}
              placeholder="SO 0001"
            />
            <label>Customer</label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label>Basic rate</label>
            <div className="field-with-unit field-with-prefix">
              <span className="field-unit">Rs</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={saleRate}
                onChange={(e) => setSaleRate(e.target.value)}
              />
            </div>
            {saleRateBreakdown != null && (
              <>
                <label>Rate breakdown</label>
                <div className="text-sm font-medium">
                  {formatRateBreakdownLine(saleRateBreakdown)}
                </div>
              </>
            )}
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              Creates an OPEN sale order with quantity null, then the dispatch.
            </p>
          </>
        )}

        <label>Delivery terms</label>
        <div
          className="segment-control"
          role="radiogroup"
          aria-label="Delivery terms"
        >
          <button
            type="button"
            role="radio"
            aria-checked={dispatchTerms === DispatchTerms.FOR}
            className={`segment-option${dispatchTerms === DispatchTerms.FOR ? " segment-option-selected" : ""}`}
            onClick={() => setDispatchTerms(DispatchTerms.FOR)}
          >
            FOR
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={dispatchTerms === DispatchTerms.EX_PORT}
            className={`segment-option${dispatchTerms === DispatchTerms.EX_PORT ? " segment-option-selected" : ""}`}
            onClick={() => {
              setDispatchTerms(DispatchTerms.EX_PORT);
              setTransporterId("");
              setFreight("");
            }}
          >
            Ex-Port
          </button>
        </div>

        <label>Transporter</label>
        {dispatchTerms === DispatchTerms.FOR ? (
          <select
            required
            value={transporterId}
            onChange={(e) => setTransporterId(e.target.value)}
          >
            <option value="">Select</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-neutral-600">Not required for Ex-Port</div>
        )}

        {dispatchTerms === DispatchTerms.FOR ? (
          <>
            <label>Freight</label>
            <div className="field-with-unit">
              <input
                required
                type="number"
                step="any"
                min="0"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
                placeholder="Per MT"
              />
              <span className="field-unit">Rs/MT</span>
            </div>
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              FOR: sale rate includes freight. Freight is subtracted to get the
              goods price for profit.
            </p>
          </>
        ) : (
          <>
            <div />
            <div />
          </>
        )}

        <label>Sale invoice</label>
        <input
          value={saleInvoiceNumber}
          onChange={(e) => setSaleInvoiceNumber(e.target.value.toUpperCase())}
        />

        <label>Purchase invoice</label>
        <input
          value={purchaseInvoiceNumber}
          onChange={(e) =>
            setPurchaseInvoiceNumber(e.target.value.toUpperCase())
          }
        />

        <div />
        <div className="modal-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving…" : "Create dispatch"}
          </button>
        </div>
      </form>
    </div>
  );
}
