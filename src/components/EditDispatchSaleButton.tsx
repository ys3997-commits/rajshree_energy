"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DispatchTerms } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import { formatMtNumber } from "@/lib/domain/format";

export type SaleEditRowSummary = {
  dispatchNumber: string;
  date: string;
  lorryNumber: string;
  weight: string;
  basicPrice: string;
  totalPrice: string;
  deliveryTerms: string;
  transporter: string;
};

function isSaleComplete(input: {
  saleInvoiceNumber: string | null;
  receivingQuantity: string | null;
  dispatchTerms: DispatchTerms;
}): boolean {
  if (input.dispatchTerms === DispatchTerms.EX_PORT) {
    return Boolean(input.saleInvoiceNumber?.trim());
  }
  return (
    Boolean(input.saleInvoiceNumber?.trim()) &&
    Boolean(input.receivingQuantity?.trim())
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="purchase-edit-summary-label">{label}</span>
      <span className="purchase-edit-summary-value">{value}</span>
    </>
  );
}

export function EditDispatchSaleButton({
  dispatchId,
  saleInvoiceNumber,
  dispatchedQuantity,
  receivingQuantity,
  dispatchTerms,
  rowSummary,
}: {
  dispatchId: string;
  saleInvoiceNumber: string | null;
  dispatchedQuantity: string;
  receivingQuantity: string | null;
  dispatchTerms: DispatchTerms;
  rowSummary?: SaleEditRowSummary;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saleInvoice, setSaleInvoice] = useState(saleInvoiceNumber ?? "");
  const [receivedQty, setReceivedQty] = useState(
    dispatchTerms === DispatchTerms.EX_PORT
      ? dispatchedQuantity
      : (receivingQuantity ?? ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isExPort = dispatchTerms === DispatchTerms.EX_PORT;

  const complete = isSaleComplete({
    saleInvoiceNumber,
    receivingQuantity,
    dispatchTerms,
  });

  const diffQty = useMemo(() => {
    if (isExPort) return 0;
    const trimmed = receivedQty.trim();
    if (!trimmed) return null;
    const received = Number(trimmed);
    const dispatched = Number(dispatchedQuantity);
    if (!Number.isFinite(received) || !Number.isFinite(dispatched)) return null;
    return dispatched - received;
  }, [dispatchedQuantity, isExPort, receivedQty]);

  function openModal() {
    setSaleInvoice(saleInvoiceNumber ?? "");
    setReceivedQty(
      isExPort ? dispatchedQuantity : (receivingQuantity ?? ""),
    );
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const trimmedReceived = isExPort
        ? dispatchedQuantity.trim()
        : receivedQty.trim();
      await updateDispatch(dispatchId, {
        saleInvoiceNumber: saleInvoice,
        receivingQuantity: trimmedReceived === "" ? null : trimmedReceived,
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
        className={`btn btn-sm ${
          complete ? "btn-checklist-complete" : "btn-checklist-pending"
        }`}
        onClick={openModal}
      >
        Sale edit
      </button>
      <Modal
        open={open}
        title="Sale edit"
        wide={Boolean(rowSummary)}
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        {rowSummary ? (
          <section className="purchase-edit-summary">
            <h3 className="purchase-edit-section-title">Dispatch details</h3>
            <div className="form-grid form-grid-plain purchase-edit-summary-grid">
              <SummaryField
                label="Dispatch no"
                value={rowSummary.dispatchNumber}
              />
              <SummaryField label="Date" value={rowSummary.date} />
              <SummaryField label="Lorry no" value={rowSummary.lorryNumber} />
              <SummaryField label="Weight" value={rowSummary.weight} />
              <SummaryField label="Basic price" value={rowSummary.basicPrice} />
              <SummaryField label="Total price" value={rowSummary.totalPrice} />
              <SummaryField
                label="Delivery terms"
                value={rowSummary.deliveryTerms}
              />
              <SummaryField
                label="Transporter name"
                value={rowSummary.transporter}
              />
            </div>
          </section>
        ) : null}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          {rowSummary ? (
            <h3
              className="purchase-edit-section-title"
              style={{ gridColumn: "1 / -1" }}
            >
              Update sale
            </h3>
          ) : null}
          <label htmlFor={`sale-invoice-${dispatchId}`}>
            Sale invoice number
          </label>
          <input
            id={`sale-invoice-${dispatchId}`}
            value={saleInvoice}
            onChange={(e) => setSaleInvoice(e.target.value)}
            placeholder="Sale invoice number"
            autoFocus={!rowSummary}
          />

          <label htmlFor={`factory-qty-${dispatchId}`}>
            Factory receiving quantity
          </label>
          <div className="field-with-unit">
            <input
              id={`factory-qty-${dispatchId}`}
              type="number"
              step="any"
              min="0"
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              placeholder={dispatchedQuantity}
              readOnly={isExPort}
              tabIndex={isExPort ? -1 : undefined}
            />
            <span className="field-unit">MT</span>
          </div>
          {isExPort && (
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              Ex-Port: received quantity matches weight automatically (diff 0).
            </p>
          )}

          <label htmlFor={`diff-qty-${dispatchId}`}>Diff quantity</label>
          <div className="field-with-unit">
            <input
              id={`diff-qty-${dispatchId}`}
              type="text"
              readOnly
              value={diffQty == null ? "—" : formatMtNumber(diffQty)}
              tabIndex={-1}
            />
            <span className="field-unit">MT</span>
          </div>

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
