"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DispatchTerms } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import { updateDispatch } from "@/lib/actions/dispatch";
import { CHECKLIST_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import { isSaleChecklistComplete } from "@/lib/domain/dispatchChecklist";
import { formatMtNumber } from "@/lib/domain/format";

export type SaleEditRowSummary = {
  dispatchNumber: string;
  date: string;
  lorryNumber: string;
  weight: string;
  basicPrice: string;
  gst: string;
  tcs: string;
  totalAmount: string;
  customer: string;
  deliveryTerms: string;
  transporter: string;
};

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="purchase-edit-summary-label">{label}</span>
      <span className="purchase-edit-summary-value">{value}</span>
    </>
  );
}

export type SaleEditMode = "all" | "invoice" | "weight";

function modalTitle(mode: SaleEditMode): string {
  if (mode === "invoice") return "Sale Invoice";
  if (mode === "weight") return "Factory Weight";
  return "Sale edit";
}

function sectionTitle(mode: SaleEditMode): string {
  if (mode === "invoice") return "Update sale invoice";
  if (mode === "weight") return "Update factory weight";
  return "Update sale";
}

function isFactoryWeightComplete(input: {
  receivingQuantity: string | null;
  dispatchTerms: DispatchTerms;
}): boolean {
  if (input.dispatchTerms === DispatchTerms.EX_PORT) return true;
  return Boolean(input.receivingQuantity?.trim());
}

export function EditDispatchSaleButton({
  dispatchId,
  saleInvoiceNumber,
  dispatchedQuantity,
  receivingQuantity,
  dispatchTerms,
  rowSummary,
  canEdit = true,
  mode = "all",
}: {
  dispatchId: string;
  saleInvoiceNumber: string | null;
  dispatchedQuantity: string;
  receivingQuantity: string | null;
  dispatchTerms: DispatchTerms;
  rowSummary?: SaleEditRowSummary;
  canEdit?: boolean;
  mode?: SaleEditMode;
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
  const showInvoice = mode === "all" || mode === "invoice";
  const showWeight = mode === "all" || mode === "weight";
  const fieldId = `${mode}-${dispatchId}`;

  const isExPort = dispatchTerms === DispatchTerms.EX_PORT;

  const complete =
    mode === "invoice"
      ? Boolean(saleInvoiceNumber?.trim())
      : mode === "weight"
        ? isFactoryWeightComplete({ receivingQuantity, dispatchTerms })
        : isSaleChecklistComplete({
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
        ...(showInvoice ? { saleInvoiceNumber: saleInvoice } : {}),
        ...(showWeight
          ? {
              receivingQuantity:
                trimmedReceived === "" ? null : trimmedReceived,
            }
          : {}),
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
        {modalTitle(mode)}
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
              <SummaryField label="Loading Qty" value={rowSummary.weight} />
              <SummaryField label="Basic price" value={rowSummary.basicPrice} />
              <SummaryField label="GST" value={rowSummary.gst} />
              <SummaryField label="TCS" value={rowSummary.tcs} />
              <SummaryField
                label="Total amount"
                value={rowSummary.totalAmount}
              />
              <SummaryField label="Customer" value={rowSummary.customer} />
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
              {sectionTitle(mode)}
            </h3>
          ) : null}
          {showInvoice ? (
            <>
              <label htmlFor={`sale-invoice-${fieldId}`}>
                {mode === "invoice" ? "Sale Invoice" : "Sale Invoice Number"}
              </label>
              <input
                id={`sale-invoice-${fieldId}`}
                value={saleInvoice}
                onChange={(e) => setSaleInvoice(e.target.value.toUpperCase())}
                placeholder="Sale invoice number"
                autoFocus={!rowSummary}
              />
            </>
          ) : null}

          {showWeight ? (
            <>
              <label htmlFor={`factory-qty-${fieldId}`}>
                Factory Receiving Quantity
              </label>
              <div className="field-with-unit">
                <input
                  id={`factory-qty-${fieldId}`}
                  type="number"
                  step="any"
                  min="0"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value)}
                  placeholder={dispatchedQuantity}
                  readOnly={isExPort}
                  tabIndex={isExPort ? -1 : undefined}
                  autoFocus={mode === "weight" && !rowSummary && !isExPort}
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

              <label htmlFor={`diff-qty-${fieldId}`}>Diff Quantity</label>
              <div className="field-with-unit">
                <input
                  id={`diff-qty-${fieldId}`}
                  type="text"
                  readOnly
                  value={diffQty == null ? "—" : formatMtNumber(diffQty)}
                  tabIndex={-1}
                />
                <span className="field-unit">MT</span>
              </div>
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
