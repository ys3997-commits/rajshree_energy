"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DispatchTerms } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import { formatMt } from "@/lib/domain/format";

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

export function EditDispatchSaleButton({
  dispatchId,
  saleInvoiceNumber,
  dispatchedQuantity,
  receivingQuantity,
  dispatchTerms,
}: {
  dispatchId: string;
  saleInvoiceNumber: string | null;
  dispatchedQuantity: string;
  receivingQuantity: string | null;
  dispatchTerms: DispatchTerms;
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
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <label htmlFor={`sale-invoice-${dispatchId}`}>
            Sale invoice number
          </label>
          <input
            id={`sale-invoice-${dispatchId}`}
            value={saleInvoice}
            onChange={(e) => setSaleInvoice(e.target.value)}
            placeholder="Sale invoice number"
            autoFocus
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
    </span>
  );
}
