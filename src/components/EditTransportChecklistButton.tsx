"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import {
  updateTransportChecklist,
  type TransportChecklistInput,
} from "@/lib/actions/transportEngine";
import { CHECKLIST_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import {
  isBiltyChecklistComplete,
  isTransportChecklistComplete,
  isTransportInvoiceChecklistComplete,
} from "@/lib/domain/dispatchChecklist";

export type TransportChecklistMode = "all" | "bilty" | "invoice";

export type TransportEditRowSummary = {
  dispatchNumber: string;
  date: string;
  saleInvoice: string;
  lorryNumber: string;
  loadingWeight: string;
  receivingWeight: string;
  diffInWeight: string;
  customer: string;
  portName: string;
  unloadingPlace: string;
  deliveryTerms: string;
  transporter: string;
  freightPerTon: string;
  freightAmount: string;
};

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="purchase-edit-summary-label">{label}</span>
      <span className="purchase-edit-summary-value">{value}</span>
    </>
  );
}

function modalTitle(mode: TransportChecklistMode, hasSummary: boolean): string {
  if (mode === "bilty") return "Bilty edit";
  if (mode === "invoice") return "Invoice edit";
  return hasSummary ? "Transport edit" : "Transport checklist";
}

export function EditTransportChecklistButton({
  dispatchId,
  biltyHardCopy: initialBiltyHardCopy,
  transportInvoiceNo: initialTransportInvoiceNo,
  invoiceHardCopy: initialInvoiceHardCopy,
  softCopyStatus,
  transportEntryInTally: initialTransportEntryInTally,
  rowSummary,
  buttonLabel = "Edit",
  mode = "all",
  onUpdated,
  canEdit = true,
}: {
  dispatchId: string;
  biltyHardCopy: boolean;
  transportInvoiceNo: string | null;
  invoiceHardCopy: boolean;
  softCopyStatus: boolean;
  transportEntryInTally: boolean;
  rowSummary?: TransportEditRowSummary;
  buttonLabel?: string;
  mode?: TransportChecklistMode;
  onUpdated?: (result: TransportChecklistInput) => void;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [biltyHardCopy, setBiltyHardCopy] = useState(initialBiltyHardCopy);
  const [transportInvoiceNo, setTransportInvoiceNo] = useState(
    initialTransportInvoiceNo ?? "",
  );
  const [invoiceHardCopy, setInvoiceHardCopy] = useState(initialInvoiceHardCopy);
  const [transportEntryInTally, setTransportEntryInTally] = useState(
    initialTransportEntryInTally,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const showBilty = mode === "all" || mode === "bilty";
  const showInvoice = mode === "all" || mode === "invoice";
  const fieldId = `${mode}-${dispatchId}`;

  const complete =
    mode === "bilty"
      ? isBiltyChecklistComplete({ biltyHardCopy: initialBiltyHardCopy })
      : mode === "invoice"
        ? isTransportInvoiceChecklistComplete({
            transportInvoiceNo: initialTransportInvoiceNo,
            invoiceHardCopy: initialInvoiceHardCopy,
            transportEntryInTally: initialTransportEntryInTally,
          })
        : isTransportChecklistComplete({
            biltyHardCopy: initialBiltyHardCopy,
            transportInvoiceNo: initialTransportInvoiceNo,
            invoiceHardCopy: initialInvoiceHardCopy,
            transportEntryInTally: initialTransportEntryInTally,
          });

  function openModal() {
    setBiltyHardCopy(initialBiltyHardCopy);
    setTransportInvoiceNo(initialTransportInvoiceNo ?? "");
    setInvoiceHardCopy(initialInvoiceHardCopy);
    setTransportEntryInTally(initialTransportEntryInTally);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const result = await updateTransportChecklist(dispatchId, {
        biltyHardCopy: showBilty ? biltyHardCopy : initialBiltyHardCopy,
        transportInvoiceNo: showInvoice
          ? transportInvoiceNo.trim() === ""
            ? null
            : transportInvoiceNo
          : initialTransportInvoiceNo,
        invoiceHardCopy: showInvoice ? invoiceHardCopy : initialInvoiceHardCopy,
        softCopyStatus,
        transportEntryInTally: showInvoice
          ? transportEntryInTally
          : initialTransportEntryInTally,
      });
      onUpdated?.(result);
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
        title={modalTitle(mode, Boolean(rowSummary))}
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
              <SummaryField label="Sale invoice" value={rowSummary.saleInvoice} />
              <SummaryField label="Lorry number" value={rowSummary.lorryNumber} />
              <SummaryField
                label="Loaded qty"
                value={rowSummary.loadingWeight}
              />
              <SummaryField
                label="Unloaded qty"
                value={rowSummary.receivingWeight}
              />
              <SummaryField label="Diff qty" value={rowSummary.diffInWeight} />
              <SummaryField label="Customer name" value={rowSummary.customer} />
              <SummaryField
                label="Loading place"
                value={rowSummary.portName}
              />
              <SummaryField
                label="Unloading place"
                value={rowSummary.unloadingPlace}
              />
              <SummaryField
                label="Delivery terms"
                value={rowSummary.deliveryTerms}
              />
              <SummaryField
                label="Transporter name"
                value={rowSummary.transporter}
              />
              <SummaryField
                label="Freight PMT"
                value={rowSummary.freightPerTon}
              />
              <SummaryField
                label="Freight amount"
                value={rowSummary.freightAmount}
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
              {mode === "bilty"
                ? "Update bilty"
                : mode === "invoice"
                  ? "Update invoice"
                  : "Update transport"}
            </h3>
          ) : null}
          {showBilty ? (
            <>
              <label htmlFor={`te-bilty-${fieldId}`}>Bilty hard copy</label>
              <input
                id={`te-bilty-${fieldId}`}
                type="checkbox"
                className="dispatch-bool-toggle"
                checked={biltyHardCopy}
                onChange={(e) => setBiltyHardCopy(e.target.checked)}
              />
            </>
          ) : null}

          {showInvoice ? (
            <>
              <label htmlFor={`te-invoice-no-${fieldId}`}>
                Transport invoice no.
              </label>
              <input
                id={`te-invoice-no-${fieldId}`}
                value={transportInvoiceNo}
                onChange={(e) =>
                  setTransportInvoiceNo(e.target.value.toUpperCase())
                }
                placeholder="Transport invoice number"
                autoFocus={!rowSummary}
              />

              <label htmlFor={`te-hard-${fieldId}`}>Invoice hard copy</label>
              <input
                id={`te-hard-${fieldId}`}
                type="checkbox"
                className="dispatch-bool-toggle"
                checked={invoiceHardCopy}
                onChange={(e) => setInvoiceHardCopy(e.target.checked)}
              />

              <label htmlFor={`te-tally-${fieldId}`}>
                Transport invoice in Tally
              </label>
              <input
                id={`te-tally-${fieldId}`}
                type="checkbox"
                className="dispatch-bool-toggle"
                checked={transportEntryInTally}
                onChange={(e) => setTransportEntryInTally(e.target.checked)}
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
