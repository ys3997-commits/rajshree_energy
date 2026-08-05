"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DispatchTerms } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import {
  formatMt,
  normalizeLorryNumber,
} from "@/lib/domain/format";

type OrderOpt = {
  poNumber: string;
  balanceOrder: string | null;
  customerName: string | null;
};

type PurchaseOpt = {
  poNumber: string;
  balanceOrder: string | null;
  vendorName: string | null;
  vesselName: string | null;
};

type TransporterOpt = {
  id: string;
  name: string;
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
  orders,
  purchaseOrders,
  transporters,
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
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  transporters: TransporterOpt[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(dispatchDate);
  const [lorry, setLorry] = useState(lorryNumber ?? "");
  const [qty, setQty] = useState(dispatchedQuantity);
  const [purchasePo, setPurchasePo] = useState(purchasePoNumber);
  const [salePo, setSalePo] = useState(salePoNumber);
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
      list.unshift({
        poNumber: salePoNumber,
        balanceOrder: null,
        customerName: null,
      });
    }
    return list;
  }, [orders, salePoNumber]);

  const purchaseOptions = useMemo(() => {
    const list = [...purchaseOrders];
    if (
      purchasePoNumber &&
      !list.some((p) => p.poNumber === purchasePoNumber)
    ) {
      list.unshift({
        poNumber: purchasePoNumber,
        balanceOrder: null,
        vendorName: null,
        vesselName: null,
      });
    }
    return list;
  }, [purchaseOrders, purchasePoNumber]);

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
    setPurchasePo(purchasePoNumber);
    setSalePo(salePoNumber);
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
      const trimmedReceived =
        terms === DispatchTerms.EX_PORT ? qty.trim() : receivedQty.trim();
      await updateDispatch(dispatchId, {
        dispatchDate: date,
        lorryNumber: lorry.trim()
          ? (normalizeLorryNumber(lorry) ?? null)
          : null,
        dispatchedQuantity: qty,
        purchasePoNumber: purchasePo,
        poNumber: salePo,
        dispatchTerms: terms,
        transporterId: terms === DispatchTerms.FOR ? transporter || null : null,
        freight:
          terms === DispatchTerms.FOR
            ? freightValue.trim() || null
            : null,
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
      <button type="button" className="btn btn-sm btn-secondary" onClick={openModal}>
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

          <label htmlFor={`edit-purchase-po-${dispatchId}`}>Purchase order</label>
          <select
            id={`edit-purchase-po-${dispatchId}`}
            required
            value={purchasePo}
            onChange={(e) => setPurchasePo(e.target.value)}
          >
            {purchaseOptions.map((p) => (
              <option key={p.poNumber} value={p.poNumber}>
                {p.poNumber}
                {p.vendorName ? ` — ${p.vendorName}` : ""}
                {p.vesselName ? ` — ${p.vesselName}` : ""}
                {p.balanceOrder != null ? ` (bal ${p.balanceOrder} MT)` : ""}
              </option>
            ))}
          </select>

          <label htmlFor={`edit-sale-po-${dispatchId}`}>Sale order</label>
          <select
            id={`edit-sale-po-${dispatchId}`}
            required
            value={salePo}
            onChange={(e) => setSalePo(e.target.value)}
          >
            {saleOptions.map((o) => (
              <option key={o.poNumber} value={o.poNumber}>
                {o.poNumber}
                {o.customerName ? ` — ${o.customerName}` : ""}
                {o.balanceOrder != null ? ` (bal ${o.balanceOrder} MT)` : ""}
              </option>
            ))}
          </select>

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
            <div className="text-sm text-neutral-600">Not required for Ex-Port</div>
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
