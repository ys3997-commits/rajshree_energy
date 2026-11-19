"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import { CHECKLIST_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import { isPurchaseChecklistComplete } from "@/lib/domain/dispatchChecklist";

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

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="purchase-edit-summary-label">{label}</span>
      <span className="purchase-edit-summary-value">{value}</span>
    </>
  );
}

export type PurchaseEditMode = "all" | "invoice" | "tally";

function modalTitle(mode: PurchaseEditMode): string {
  if (mode === "invoice") return "Purchase Invoice";
  if (mode === "tally") return "Purchase In Tally";
  return "Purchase edit";
}

function sectionTitle(mode: PurchaseEditMode): string {
  if (mode === "invoice") return "Update purchase invoice";
  if (mode === "tally") return "Update purchase in tally";
  return "Update purchase";
}

function defaultButtonLabel(mode: PurchaseEditMode): string {
  return modalTitle(mode);
}

export function EditDispatchPurchaseButton({
  dispatchId,
  purchaseInvoiceNumber,
  entryInTally,
  rowSummary,
  canEdit = true,
  mode = "all",
  buttonLabel,
}: {
  dispatchId: string;
  purchaseInvoiceNumber: string | null;
  entryInTally: boolean;
  rowSummary?: PurchaseEditRowSummary;
  canEdit?: boolean;
  mode?: PurchaseEditMode;
  buttonLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [purchaseInvoice, setPurchaseInvoice] = useState(
    purchaseInvoiceNumber ?? "",
  );
  const [tally, setTally] = useState(entryInTally);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const showInvoice = mode === "all" || mode === "invoice";
  const showTally = mode === "all" || mode === "tally";
  const fieldId = `${mode}-${dispatchId}`;

  const complete =
    mode === "invoice"
      ? Boolean(purchaseInvoiceNumber?.trim())
      : mode === "tally"
        ? entryInTally
        : isPurchaseChecklistComplete({
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
        ...(showInvoice ? { purchaseInvoiceNumber: purchaseInvoice } : {}),
        ...(showTally ? { entryInTally: tally } : {}),
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
        disabled={!canEdit}
        title={canEdit ? undefined : CHECKLIST_EDIT_LOCK_HINT}
      >
        {buttonLabel ?? defaultButtonLabel(mode)}
      </button>
      <Modal
        open={open}
        title={modalTitle(mode)}
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
              {sectionTitle(mode)}
            </h3>
          ) : null}
          {showInvoice ? (
            <>
              <label htmlFor={`purchase-invoice-${fieldId}`}>
                {mode === "invoice"
                  ? "Purchase Invoice"
                  : "Purchase Invoice Number"}
              </label>
              <input
                id={`purchase-invoice-${fieldId}`}
                value={purchaseInvoice}
                onChange={(e) =>
                  setPurchaseInvoice(e.target.value.toUpperCase())
                }
                placeholder="Purchase invoice number"
                autoFocus={!rowSummary}
              />
            </>
          ) : null}

          {showTally ? (
            <>
              <label htmlFor={`tally-${fieldId}`}>
                {mode === "tally"
                  ? "Purchase In Tally"
                  : "Purchase Invoice In Tally"}
              </label>
              <input
                id={`tally-${fieldId}`}
                type="checkbox"
                className="dispatch-bool-toggle"
                checked={tally}
                onChange={(e) => setTally(e.target.checked)}
              />
            </>
          ) : null}

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
