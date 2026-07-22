"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";

export function EditDispatchInvoicesButton({
  dispatchId,
  saleInvoiceNumber,
  purchaseInvoiceNumber,
  label,
}: {
  dispatchId: string;
  saleInvoiceNumber: string | null;
  purchaseInvoiceNumber: string | null;
  /** Shown on the button — defaults to “Edit invoices”. */
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saleInvoice, setSaleInvoice] = useState(saleInvoiceNumber ?? "");
  const [purchaseInvoice, setPurchaseInvoice] = useState(
    purchaseInvoiceNumber ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function openModal() {
    setSaleInvoice(saleInvoiceNumber ?? "");
    setPurchaseInvoice(purchaseInvoiceNumber ?? "");
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateDispatch(dispatchId, {
        saleInvoiceNumber: saleInvoice,
        purchaseInvoiceNumber: purchaseInvoice,
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
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={openModal}
      >
        {label ?? "Edit invoices"}
      </button>
      <Modal
        open={open}
        title="Edit invoices"
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <label>Sale invoice</label>
          <input
            value={saleInvoice}
            onChange={(e) => setSaleInvoice(e.target.value)}
            placeholder="Sale invoice number"
            autoFocus
          />

          <label>Purchase invoice</label>
          <input
            value={purchaseInvoice}
            onChange={(e) => setPurchaseInvoice(e.target.value)}
            placeholder="Purchase invoice number"
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
    </>
  );
}
