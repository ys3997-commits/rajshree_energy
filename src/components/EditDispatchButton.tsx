"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerCategory, DispatchTerms } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import {
  formatMt,
  formatQualityClass,
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

type TransporterOpt = {
  id: string;
  name: string;
};

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
};

type VesselOpt = {
  id: string;
  vesselName: string;
};

export function EditDispatchButton({
  dispatchId,
  dispatchDate,
  lorryNumber,
  dispatchedQuantity,
  purchasePoNumber,
  salePoNumber,
  dispatchTerms,
  transporterId,
  freight,
  saleInvoiceNumber,
  purchaseInvoiceNumber,
  receivingQuantity,
  entryInTally,
  currentSaleCustomerName,
  currentPurchaseVendorName,
  currentVesselName,
  orders,
  purchaseOrders,
  transporters,
  customers,
  vessels,
  suggestedPo,
  suggestedPurchasePo,
}: {
  dispatchId: string;
  dispatchDate: string;
  lorryNumber: string | null;
  dispatchedQuantity: string;
  purchasePoNumber: string;
  salePoNumber: string;
  dispatchTerms: DispatchTerms;
  transporterId: string | null;
  freight: string | null;
  saleInvoiceNumber: string | null;
  purchaseInvoiceNumber: string | null;
  receivingQuantity: string | null;
  entryInTally: boolean;
  currentSaleCustomerName: string | null;
  currentPurchaseVendorName: string | null;
  currentVesselName: string | null;
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  transporters: TransporterOpt[];
  customers: CustomerOpt[];
  vessels: VesselOpt[];
  suggestedPo: string;
  suggestedPurchasePo: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dispatchDate);
  const [lorry, setLorry] = useState(lorryNumber ?? "");
  const [qty, setQty] = useState(dispatchedQuantity);
  const [purchaseMode, setPurchaseMode] = useState<"existing" | "open">(
    "existing",
  );
  const [saleMode, setSaleMode] = useState<"existing" | "open">("existing");
  const [purchasePo, setPurchasePo] = useState(purchasePoNumber);
  const [openPurchasePoNumber, setOpenPurchasePoNumber] =
    useState(suggestedPurchasePo);
  const [vendorId, setVendorId] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [purchaseRate, setPurchaseRate] = useState("");
  const [salePo, setSalePo] = useState(salePoNumber);
  const [openSalePoNumber, setOpenSalePoNumber] = useState(suggestedPo);
  const [customerId, setCustomerId] = useState("");
  const [saleRate, setSaleRate] = useState("");
  const [terms, setTerms] = useState<DispatchTerms>(dispatchTerms);
  const [transporter, setTransporter] = useState(transporterId ?? "");
  const [freightValue, setFreightValue] = useState(freight ?? "");
  const [saleInvoice, setSaleInvoice] = useState(saleInvoiceNumber ?? "");
  const [purchaseInvoice, setPurchaseInvoice] = useState(
    purchaseInvoiceNumber ?? "",
  );
  const [receivedQty, setReceivedQty] = useState(receivingQuantity ?? "");
  const [tally, setTally] = useState(entryInTally);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saleOptions = useMemo(() => {
    const list = [...orders];
    if (salePoNumber && !list.some((o) => o.poNumber === salePoNumber)) {
      const matchedCustomer =
        currentSaleCustomerName != null
          ? (customers.find((c) => c.name === currentSaleCustomerName) ?? null)
          : null;
      list.unshift({
        poNumber: salePoNumber,
        balanceOrder: null,
        rate: null,
        customer: matchedCustomer
          ? { name: matchedCustomer.name, category: matchedCustomer.category }
          : currentSaleCustomerName
            ? {
                name: currentSaleCustomerName,
                category: CustomerCategory.TRADER,
              }
            : null,
      });
    }
    return list;
  }, [orders, salePoNumber, currentSaleCustomerName, customers]);

  const purchaseOptions = useMemo(() => {
    const list = [...purchaseOrders];
    if (
      purchasePoNumber &&
      !list.some((p) => p.poNumber === purchasePoNumber)
    ) {
      list.unshift({
        poNumber: purchasePoNumber,
        balanceOrder: null,
        rate: null,
        importer: currentPurchaseVendorName
          ? { name: currentPurchaseVendorName }
          : null,
        vessel: currentVesselName ? { vesselName: currentVesselName } : null,
        qualityClass: null,
      });
    }
    return list;
  }, [
    purchaseOrders,
    purchasePoNumber,
    currentPurchaseVendorName,
    currentVesselName,
  ]);

  const selectedOrder = useMemo(
    () => saleOptions.find((o) => o.poNumber === salePo) ?? null,
    [saleOptions, salePo],
  );
  const selectedPurchase = useMemo(
    () => purchaseOptions.find((p) => p.poNumber === purchasePo) ?? null,
    [purchaseOptions, purchasePo],
  );
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  );

  const purchaseRateBreakdown = useMemo(
    () => computePurchaseRateBreakdown(purchaseRate),
    [purchaseRate],
  );
  const selectedPurchaseRateBreakdown = useMemo(
    () => computePurchaseRateBreakdown(selectedPurchase?.rate),
    [selectedPurchase?.rate],
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

  const diffQty = useMemo(() => {
    if (terms === DispatchTerms.EX_PORT) return 0;
    const trimmed = receivedQty.trim();
    if (!trimmed) return null;
    const received = Number(trimmed);
    const dispatched = Number(qty);
    if (!Number.isFinite(received) || !Number.isFinite(dispatched)) return null;
    return dispatched - received;
  }, [qty, receivedQty, terms]);

  function openModal() {
    setDate(dispatchDate);
    setLorry(lorryNumber ?? "");
    setQty(dispatchedQuantity);
    setPurchaseMode("existing");
    setSaleMode("existing");
    setPurchasePo(purchasePoNumber);
    setOpenPurchasePoNumber(suggestedPurchasePo);
    setVendorId("");
    setVesselId("");
    setPurchaseRate("");
    setSalePo(salePoNumber);
    setOpenSalePoNumber(suggestedPo);
    setCustomerId("");
    setSaleRate("");
    setTerms(dispatchTerms);
    setTransporter(transporterId ?? "");
    setFreightValue(freight ?? "");
    setSaleInvoice(saleInvoiceNumber ?? "");
    setPurchaseInvoice(purchaseInvoiceNumber ?? "");
    setReceivedQty(
      dispatchTerms === DispatchTerms.EX_PORT
        ? dispatchedQuantity
        : (receivingQuantity ?? ""),
    );
    setTally(entryInTally);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (purchaseMode === "existing" && !purchasePo) {
        throw new Error("Select a purchase order");
      }
      if (purchaseMode === "open") {
        if (!openPurchasePoNumber.trim()) {
          throw new Error("Purchase PO number is required");
        }
        if (!vendorId) throw new Error("Vendor is required");
        if (!vesselId) throw new Error("Vessel is required");
      }
      if (saleMode === "existing" && !salePo) {
        throw new Error("Select an existing sale PO");
      }
      if (saleMode === "open") {
        if (!openSalePoNumber.trim()) {
          throw new Error("Sale order number is required");
        }
        if (!customerId) throw new Error("Customer is required");
      }

      const trimmedReceived =
        terms === DispatchTerms.EX_PORT ? qty.trim() : receivedQty.trim();

      await updateDispatch(dispatchId, {
        dispatchDate: date,
        lorryNumber: lorry.trim()
          ? (normalizeLorryNumber(lorry) ?? null)
          : null,
        dispatchedQuantity: qty,
        ...(purchaseMode === "open"
          ? {
              openPurchase: {
                poNumber: openPurchasePoNumber,
                importerId: vendorId,
                vesselId,
                rate: purchaseRate.trim() || null,
              },
            }
          : { purchasePoNumber: purchasePo }),
        ...(saleMode === "open"
          ? {
              openSale: {
                poNumber: openSalePoNumber,
                customerId,
                rate: saleRate.trim() || null,
              },
            }
          : { poNumber: salePo }),
        dispatchTerms: terms,
        transporterId: terms === DispatchTerms.FOR ? transporter || null : null,
        freight:
          terms === DispatchTerms.FOR ? freightValue.trim() || null : null,
        saleInvoiceNumber: saleInvoice,
        purchaseInvoiceNumber: purchaseInvoice,
        receivingQuantity: trimmedReceived === "" ? null : trimmedReceived,
        entryInTally: tally,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <span className="dispatch-edit-action">
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={openModal}
      >
        Edit
      </button>
      <Modal
        open={open}
        title="Edit dispatch"
        wide
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <label htmlFor={`edit-date-${dispatchId}`}>Dispatch date</label>
          <input
            id={`edit-date-${dispatchId}`}
            required
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            autoFocus
          />

          <label htmlFor={`edit-lorry-${dispatchId}`}>Lorry number</label>
          <input
            id={`edit-lorry-${dispatchId}`}
            value={lorry}
            onChange={(e) => setLorry(e.target.value.toUpperCase())}
            onBlur={() => {
              if (!lorry.trim()) return;
              try {
                const formatted = normalizeLorryNumber(lorry);
                if (formatted) setLorry(formatted);
              } catch {
                // Keep typed value; submit will surface the error.
              }
            }}
          />

          <label htmlFor={`edit-qty-${dispatchId}`}>Dispatched quantity</label>
          <div className="field-with-unit">
            <input
              id={`edit-qty-${dispatchId}`}
              required
              type="number"
              step="any"
              min="0.0001"
              value={qty}
              onChange={(e) => {
                const next = e.target.value;
                setQty(next);
                if (terms === DispatchTerms.EX_PORT) {
                  setReceivedQty(next);
                }
              }}
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
                Keep or switch to a purchase order already on file
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
                Create a new open purchase order and move this dispatch to it
              </span>
            </button>
          </div>

          {purchaseMode === "existing" ? (
            <>
              <label htmlFor={`edit-purchase-po-${dispatchId}`}>
                Purchase order
              </label>
              <select
                id={`edit-purchase-po-${dispatchId}`}
                required
                value={purchasePo}
                onChange={(e) => setPurchasePo(e.target.value)}
              >
                <option value="">Select</option>
                {purchaseOptions.map((p) => (
                  <option key={p.poNumber} value={p.poNumber}>
                    {p.poNumber} — {p.importer?.name ?? "?"} —{" "}
                    {p.vessel?.vesselName ?? "?"}
                    {p.balanceOrder != null
                      ? ` (bal ${p.balanceOrder} MT)`
                      : ""}
                  </option>
                ))}
              </select>
              {selectedPurchase && (
                <>
                  <label>Purchase balance</label>
                  <div className="text-sm">
                    {selectedPurchase.balanceOrder != null
                      ? `${selectedPurchase.balanceOrder} MT`
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
              <label htmlFor={`edit-open-purchase-po-${dispatchId}`}>
                Purchase order number
              </label>
              <input
                id={`edit-open-purchase-po-${dispatchId}`}
                required
                value={openPurchasePoNumber}
                onChange={(e) => setOpenPurchasePoNumber(e.target.value)}
                placeholder="PO 0001"
              />
              <label htmlFor={`edit-vendor-${dispatchId}`}>Vendor</label>
              <select
                id={`edit-vendor-${dispatchId}`}
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
              <label htmlFor={`edit-vessel-${dispatchId}`}>Vessel</label>
              <select
                id={`edit-vessel-${dispatchId}`}
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
              <label htmlFor={`edit-purchase-rate-${dispatchId}`}>
                Basic rate
              </label>
              <div className="field-with-unit field-with-prefix">
                <span className="field-unit">Rs</span>
                <input
                  id={`edit-purchase-rate-${dispatchId}`}
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
                Creates an OPEN purchase order with quantity null, then moves
                this dispatch onto it.
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
              aria-checked={saleMode === "existing"}
              className={`option-card${saleMode === "existing" ? " option-card-selected" : ""}`}
              onClick={() => setSaleMode("existing")}
            >
              <span className="option-card-title">Existing sale PO</span>
              <span className="option-card-desc">
                Keep or switch to a sale order already on file
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={saleMode === "open"}
              className={`option-card${saleMode === "open" ? " option-card-selected" : ""}`}
              onClick={() => setSaleMode("open")}
            >
              <span className="option-card-title">Open sale order</span>
              <span className="option-card-desc">
                Create a new open sale order and move this dispatch to it
              </span>
            </button>
          </div>

          {saleMode === "existing" ? (
            <>
              <label htmlFor={`edit-sale-po-${dispatchId}`}>Sale order</label>
              <select
                id={`edit-sale-po-${dispatchId}`}
                required
                value={salePo}
                onChange={(e) => setSalePo(e.target.value)}
              >
                <option value="">Select</option>
                {saleOptions.map((o) => (
                  <option key={o.poNumber} value={o.poNumber}>
                    {o.poNumber} — {o.customer?.name ?? "?"}
                    {o.balanceOrder != null
                      ? ` (bal ${o.balanceOrder} MT)`
                      : ""}
                  </option>
                ))}
              </select>
              {selectedOrder && (
                <>
                  <label>Sale balance</label>
                  <div className="text-sm">
                    {selectedOrder.balanceOrder != null
                      ? `${selectedOrder.balanceOrder} MT`
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
              <label htmlFor={`edit-open-sale-po-${dispatchId}`}>
                Sale order number
              </label>
              <input
                id={`edit-open-sale-po-${dispatchId}`}
                required
                value={openSalePoNumber}
                onChange={(e) => setOpenSalePoNumber(e.target.value)}
                placeholder="SO 0001"
              />
              <label htmlFor={`edit-customer-${dispatchId}`}>Customer</label>
              <select
                id={`edit-customer-${dispatchId}`}
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
              <label htmlFor={`edit-sale-rate-${dispatchId}`}>Basic rate</label>
              <div className="field-with-unit field-with-prefix">
                <span className="field-unit">Rs</span>
                <input
                  id={`edit-sale-rate-${dispatchId}`}
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
                Creates an OPEN sale order with quantity null, then moves this
                dispatch onto it.
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
              aria-checked={terms === DispatchTerms.FOR}
              className={`segment-option${terms === DispatchTerms.FOR ? " segment-option-selected" : ""}`}
              onClick={() => setTerms(DispatchTerms.FOR)}
            >
              FOR
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={terms === DispatchTerms.EX_PORT}
              className={`segment-option${terms === DispatchTerms.EX_PORT ? " segment-option-selected" : ""}`}
              onClick={() => {
                setTerms(DispatchTerms.EX_PORT);
                setTransporter("");
                setFreightValue("");
                setReceivedQty(qty);
              }}
            >
              Ex-Port
            </button>
          </div>

          <label htmlFor={`edit-transporter-${dispatchId}`}>Transporter</label>
          {terms === DispatchTerms.FOR ? (
            <select
              id={`edit-transporter-${dispatchId}`}
              required
              value={transporter}
              onChange={(e) => setTransporter(e.target.value)}
            >
              <option value="">Select</option>
              {transporters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-neutral-600">
              Not required for Ex-Port
            </div>
          )}

          {terms === DispatchTerms.FOR ? (
            <>
              <label htmlFor={`edit-freight-${dispatchId}`}>Freight</label>
              <div className="field-with-unit">
                <input
                  id={`edit-freight-${dispatchId}`}
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={freightValue}
                  onChange={(e) => setFreightValue(e.target.value)}
                  placeholder="Per MT"
                />
                <span className="field-unit">Rs/MT</span>
              </div>
            </>
          ) : (
            <>
              <div />
              <div />
            </>
          )}

          <label htmlFor={`edit-sale-invoice-${dispatchId}`}>
            Sale invoice number
          </label>
          <input
            id={`edit-sale-invoice-${dispatchId}`}
            value={saleInvoice}
            onChange={(e) => setSaleInvoice(e.target.value)}
          />

          <label htmlFor={`edit-purchase-invoice-${dispatchId}`}>
            Purchase invoice number
          </label>
          <input
            id={`edit-purchase-invoice-${dispatchId}`}
            value={purchaseInvoice}
            onChange={(e) => setPurchaseInvoice(e.target.value)}
          />

          <label htmlFor={`edit-received-${dispatchId}`}>
            Factory receiving quantity
          </label>
          <div className="field-with-unit">
            <input
              id={`edit-received-${dispatchId}`}
              type="number"
              step="any"
              min="0"
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              placeholder={qty}
              readOnly={terms === DispatchTerms.EX_PORT}
              tabIndex={terms === DispatchTerms.EX_PORT ? -1 : undefined}
            />
            <span className="field-unit">MT</span>
          </div>
          {terms === DispatchTerms.EX_PORT && (
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              Ex-Port: received quantity matches weight automatically (diff 0).
            </p>
          )}

          <label htmlFor={`edit-diff-${dispatchId}`}>Diff quantity</label>
          <div className="field-with-unit">
            <input
              id={`edit-diff-${dispatchId}`}
              type="text"
              readOnly
              value={diffQty == null ? "—" : formatMt(diffQty)}
              tabIndex={-1}
            />
            <span className="field-unit">MT</span>
          </div>

          <label htmlFor={`edit-tally-${dispatchId}`}>Recorded in Tally</label>
          <input
            id={`edit-tally-${dispatchId}`}
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={tally}
            onChange={(e) => setTally(e.target.checked)}
          />

          <div />
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </span>
  );
}
