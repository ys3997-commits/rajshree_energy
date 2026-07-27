"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";

function isPurchaseComplete(input: {
  purchaseInvoiceNumber: string | null;
  entryInTally: boolean;
}): boolean {
  return (
    Boolean(input.purchaseInvoiceNumber?.trim()) && input.entryInTally
  );
}

export function EditDispatchPurchaseButton({
  dispatchId,
  purchaseInvoiceNumber,
  entryInTally,
}: {
  dispatchId: string;
  purchaseInvoiceNumber: string | null;
  entryInTally: boolean;
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
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <label htmlFor={`purchase-invoice-${dispatchId}`}>
            Purchase invoice number
          </label>
          <input
            id={`purchase-invoice-${dispatchId}`}
            value={purchaseInvoice}
            onChange={(e) => setPurchaseInvoice(e.target.value)}
            placeholder="Purchase invoice number"
            autoFocus
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
