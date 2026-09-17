"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import { CHECKLIST_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import { dayKeyInIst } from "@/lib/auth/sameDayEntryModify";
import { isReconciliationComplete } from "@/lib/domain/dispatchChecklist";
import { formatDateDdMmYyyy } from "@/lib/domain/format";

export type ReconciliationRowSummary = {
  dispatchNumber: string;
  date: string;
  lorryNumber: string;
  weight: string;
  gstState: string;
  purchasePo: string;
  purchaseInvoice: string;
  vendor: string;
  purchaseBasic: string;
  purchaseGst: string;
  purchaseTcs: string;
  purchaseInvoiceAmount: string;
  salePo: string;
  saleInvoice: string;
  customer: string;
  saleBasic: string;
  saleGst: string;
  saleTcs: string;
  saleInvoiceAmount: string;
  deliveryTerms: string;
};

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="purchase-edit-summary-label">{label}</span>
      <span className="purchase-edit-summary-value">{value}</span>
    </>
  );
}

export function EditDispatchReconcileButton({
  dispatchId,
  reconciled,
  reconciledAt,
  rowSummary,
  canEdit = true,
}: {
  dispatchId: string;
  reconciled: boolean;
  reconciledAt?: string | null;
  rowSummary: ReconciliationRowSummary;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [marked, setMarked] = useState(Boolean(reconciled));
  const [labelDate, setLabelDate] = useState(reconciledAt ?? null);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(marked);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMarked(Boolean(reconciled));
    setLabelDate(reconciledAt ?? null);
  }, [reconciled, reconciledAt]);

  const complete = isReconciliationComplete({ reconciled: marked });
  const buttonLabel =
    complete && labelDate ? `Reconciled ${labelDate}` : "Reconciled";

  function openModal() {
    setTick(marked);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateDispatch(dispatchId, { reconciled: tick });
      setMarked(tick);
      setLabelDate(tick ? formatDateDdMmYyyy(dayKeyInIst(new Date())) : null);
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
        {buttonLabel}
      </button>
      <Modal
        open={open}
        title="Reconciliation"
        wide
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <section className="purchase-edit-summary">
          <h3 className="purchase-edit-section-title">Dispatch details</h3>
          <div className="form-grid form-grid-plain purchase-edit-summary-grid">
            <SummaryField label="Dispatch no" value={rowSummary.dispatchNumber} />
            <SummaryField label="Date" value={rowSummary.date} />
            <SummaryField label="Lorry no" value={rowSummary.lorryNumber} />
            <SummaryField label="Weight" value={rowSummary.weight} />
            <SummaryField label="GST state" value={rowSummary.gstState} />
            <SummaryField label="PO no" value={rowSummary.purchasePo} />
            <SummaryField
              label="Purchase invoice"
              value={rowSummary.purchaseInvoice}
            />
            <SummaryField label="Vendor" value={rowSummary.vendor} />
            <SummaryField
              label="Purchase basic price"
              value={rowSummary.purchaseBasic}
            />
            <SummaryField label="GST" value={rowSummary.purchaseGst} />
            <SummaryField label="TCS" value={rowSummary.purchaseTcs} />
            <SummaryField
              label="Total Amount"
              value={rowSummary.purchaseInvoiceAmount}
            />
            <SummaryField label="SO no" value={rowSummary.salePo} />
            <SummaryField label="Sale invoice" value={rowSummary.saleInvoice} />
            <SummaryField label="Customer name" value={rowSummary.customer} />
            <SummaryField label="Sale basic price" value={rowSummary.saleBasic} />
            <SummaryField label="GST" value={rowSummary.saleGst} />
            <SummaryField label="TCS" value={rowSummary.saleTcs} />
            <SummaryField
              label="Total Amount"
              value={rowSummary.saleInvoiceAmount}
            />
            <SummaryField
              label="Delivery terms"
              value={rowSummary.deliveryTerms}
            />
          </div>
        </section>
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <h3
            className="purchase-edit-section-title"
            style={{ gridColumn: "1 / -1" }}
          >
            Reconciliation
          </h3>
          <label htmlFor={`reconciled-${dispatchId}`}>Reconciliation</label>
          <input
            id={`reconciled-${dispatchId}`}
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={tick}
            onChange={(e) => setTick(Boolean(e.target.checked))}
            autoFocus
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
