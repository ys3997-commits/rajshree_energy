"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateBillAccountVoucherNo } from "@/lib/actions/bills";
import { CHECKLIST_EDIT_LOCK_HINT } from "@/lib/auth/editLockHint";
import { isBillAccountVoucherComplete } from "@/lib/domain/bills";

export type ApprovalEditRowSummary = {
  approvalNo: string;
  date: string;
  invoiceIssuedBy: string;
  invoiceAmount: string;
  approverName: string;
  sentBy: string;
  status: string;
  ownerRemark: string;
};

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="purchase-edit-summary-label">{label}</span>
      <span className="purchase-edit-summary-value">{value}</span>
    </>
  );
}

export function EditBillAccountVoucherButton({
  billId,
  accountVoucherNo,
  rowSummary,
  canEdit = true,
}: {
  billId: string;
  accountVoucherNo: string;
  rowSummary: ApprovalEditRowSummary;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [voucherNo, setVoucherNo] = useState(accountVoucherNo);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const complete = isBillAccountVoucherComplete({ accountVoucherNo });

  function openModal() {
    setVoucherNo(accountVoucherNo);
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateBillAccountVoucherNo(billId, voucherNo);
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
        Approval edit
      </button>
      <Modal
        open={open}
        title="Approval edit"
        wide
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <section className="purchase-edit-summary">
          <h3 className="purchase-edit-section-title">Approval details</h3>
          <div className="form-grid form-grid-plain purchase-edit-summary-grid">
            <SummaryField label="Approval no" value={rowSummary.approvalNo} />
            <SummaryField label="Date" value={rowSummary.date} />
            <SummaryField
              label="Invoice issued by"
              value={rowSummary.invoiceIssuedBy}
            />
            <SummaryField
              label="Invoice amount"
              value={rowSummary.invoiceAmount}
            />
            <SummaryField label="Approver name" value={rowSummary.approverName} />
            <SummaryField label="Sent by" value={rowSummary.sentBy} />
            <SummaryField label="Status" value={rowSummary.status} />
            <SummaryField label="Owner remark" value={rowSummary.ownerRemark} />
          </div>
        </section>
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <h3
            className="purchase-edit-section-title"
            style={{ gridColumn: "1 / -1" }}
          >
            Update approval
          </h3>
          <label htmlFor={`bill-voucher-${billId}`}>Account Voucher No</label>
          <input
            id={`bill-voucher-${billId}`}
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            placeholder="Account voucher number"
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
