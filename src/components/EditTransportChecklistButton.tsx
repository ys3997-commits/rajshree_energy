"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import {
  updateTransportChecklist,
  type TransportChecklistInput,
} from "@/lib/actions/transportEngine";
import { CHECKLIST_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import { isTransportChecklistComplete } from "@/lib/domain/dispatchChecklist";

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

export function EditTransportChecklistButton({
  dispatchId,
  biltyHardCopy: initialBiltyHardCopy,
  transportInvoiceNo: initialTransportInvoiceNo,
  invoiceHardCopy: initialInvoiceHardCopy,
  softCopyStatus,
  transportEntryInTally: initialTransportEntryInTally,
  rowSummary,
  buttonLabel = "Edit",
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

  const complete = isTransportChecklistComplete({
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
        biltyHardCopy,
        transportInvoiceNo:
          transportInvoiceNo.trim() === "" ? null : transportInvoiceNo,
        invoiceHardCopy,
        softCopyStatus,
        transportEntryInTally,
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
        title={rowSummary ? "Transport edit" : "Transport checklist"}
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
                label="Loading weight"
                value={rowSummary.loadingWeight}
              />
              <SummaryField
                label="Receiving weight"
                value={rowSummary.receivingWeight}
              />
              <SummaryField
                label="Diff in weight"
                value={rowSummary.diffInWeight}
              />
              <SummaryField label="Customer name" value={rowSummary.customer} />
              <SummaryField label="Port name" value={rowSummary.portName} />
              <SummaryField
                label="Delivery terms"
                value={rowSummary.deliveryTerms}
              />
              <SummaryField
                label="Transporter name"
                value={rowSummary.transporter}
              />
              <SummaryField
                label="Freight per ton"
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
              Update transport
            </h3>
          ) : null}
          <label htmlFor={`te-bilty-${dispatchId}`}>Bilty hard copy</label>
          <input
            id={`te-bilty-${dispatchId}`}
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={biltyHardCopy}
            onChange={(e) => setBiltyHardCopy(e.target.checked)}
          />

          <label htmlFor={`te-invoice-no-${dispatchId}`}>
            Transport invoice no.
          </label>
          <input
            id={`te-invoice-no-${dispatchId}`}
            value={transportInvoiceNo}
            onChange={(e) => setTransportInvoiceNo(e.target.value.toUpperCase())}
            placeholder="Transport invoice number"
            autoFocus={!rowSummary}
          />

          <label htmlFor={`te-hard-${dispatchId}`}>Invoice hard copy</label>
          <input
            id={`te-hard-${dispatchId}`}
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={invoiceHardCopy}
            onChange={(e) => setInvoiceHardCopy(e.target.checked)}
          />

          <label htmlFor={`te-tally-${dispatchId}`}>
            Transport invoice in Tally
          </label>
          <input
            id={`te-tally-${dispatchId}`}
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={transportEntryInTally}
            onChange={(e) => setTransportEntryInTally(e.target.checked)}
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
