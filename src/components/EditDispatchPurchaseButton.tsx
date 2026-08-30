"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";

export type PurchaseEditRowSummary = {
  dispatchNumber: string;
  date: string;
  lorryNumber: string;
  weight: string;
  basicPrice: string;
  basicAmount: string;
  gst: string;
  tcs: string;
  totalAmount: string;
  vendor: string;
  gstState: string;
};

function isPurchaseComplete(input: {
  purchaseInvoiceNumber: string | null;
  entryInTally: boolean;
}): boolean {
  return (
    Boolean(input.purchaseInvoiceNumber?.trim()) && input.entryInTally
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

export function EditDispatchPurchaseButton({
  dispatchId,
  purchaseInvoiceNumber,
  entryInTally,
  rowSummary,
}: {
  dispatchId: string;
  purchaseInvoiceNumber: string | null;
  entryInTally: boolean;
  rowSummary?: PurchaseEditRowSummary;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [purchaseInvoice, setPurchaseInvoice] = useState(
    purchaseInvoiceNumber ?? "",
  );
  const [tally, setTally] = useState(entryInTally);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const complete = isPurchaseComplete({
    purchaseInvoiceNumber,
    entryInTally,
  });

  function openModal() {
    setPurchaseInvoice(purchaseInvoiceNumber ?? "");
    setTally(entryInTally);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateDispatch(dispatchId, {
        purchaseInvoiceNumber: purchaseInvoice,
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
        className={`btn btn-sm ${
          complete ? "btn-checklist-complete" : "btn-checklist-pending"
        }`}
        onClick={openModal}
      >
        Purchase edit
      </button>
      <Modal
        open={open}
        title="Purchase edit"
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
              <SummaryField
                label="Basic Amount"
                value={rowSummary.basicAmount}
              />
              <SummaryField label="GST" value={rowSummary.gst} />
              <SummaryField label="TCS" value={rowSummary.tcs} />
              <SummaryField
                label="Total amount"
                value={rowSummary.totalAmount}
              />
              <SummaryField label="Vendor" value={rowSummary.vendor} />
              <SummaryField label="GST state" value={rowSummary.gstState} />
            </div>
          </section>
        ) : null}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          {rowSummary ? (
            <h3
              className="purchase-edit-section-title"
              style={{ gridColumn: "1 / -1" }}
            >
              Update purchase
            </h3>
          ) : null}
          <label htmlFor={`purchase-invoice-${dispatchId}`}>
            Purchase invoice number
          </label>
          <input
            id={`purchase-invoice-${dispatchId}`}
            value={purchaseInvoice}
            onChange={(e) => setPurchaseInvoice(e.target.value)}
            placeholder="Purchase invoice number"
            autoFocus={!rowSummary}
          />

          <label htmlFor={`tally-${dispatchId}`}>Recorded in Tally</label>
          <input
            id={`tally-${dispatchId}`}
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
