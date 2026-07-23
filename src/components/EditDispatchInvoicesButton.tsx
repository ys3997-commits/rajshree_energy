"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import { formatMt } from "@/lib/domain/format";

export function EditDispatchInvoicesButton({
  dispatchId,
  saleInvoiceNumber,
  purchaseInvoiceNumber,
  dispatchedQuantity,
  receivingQuantity,
}: {
  dispatchId: string;
  saleInvoiceNumber: string | null;
  purchaseInvoiceNumber: string | null;
  dispatchedQuantity: string;
  receivingQuantity: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saleInvoice, setSaleInvoice] = useState(saleInvoiceNumber ?? "");
  const [purchaseInvoice, setPurchaseInvoice] = useState(
    purchaseInvoiceNumber ?? "",
  );
  const [receivedQty, setReceivedQty] = useState(receivingQuantity ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const diffQty = useMemo(() => {
    const trimmed = receivedQty.trim();
    if (!trimmed) return null;
    const received = Number(trimmed);
    const dispatched = Number(dispatchedQuantity);
    if (!Number.isFinite(received) || !Number.isFinite(dispatched)) return null;
    return dispatched - received;
  }, [dispatchedQuantity, receivedQty]);

  function openModal() {
    setSaleInvoice(saleInvoiceNumber ?? "");
    setPurchaseInvoice(purchaseInvoiceNumber ?? "");
    setReceivedQty(receivingQuantity ?? "");
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const trimmedReceived = receivedQty.trim();
      await updateDispatch(dispatchId, {
        saleInvoiceNumber: saleInvoice,
        purchaseInvoiceNumber: purchaseInvoice,
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
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={openModal}
      >
        Edit
      </button>
      <Modal
        open={open}
        title="Edit dispatch"
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

          <label>Received quantity</label>
          <div className="field-with-unit">
            <input
              type="number"
              step="any"
              min="0"
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              placeholder={dispatchedQuantity}
            />
            <span className="field-unit">MT</span>
          </div>

          <label>Diff quantity</label>
          <div className="field-with-unit">
            <input
              type="text"
              readOnly
              value={diffQty == null ? "—" : formatMt(diffQty)}
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
    </>
  );
}
