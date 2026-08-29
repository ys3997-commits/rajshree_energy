"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { updateBillAccountVoucherNo } from "@/lib/actions/bills";

export function EditBillAccountVoucherButton({
  billId,
  accountVoucherNo,
}: {
  billId: string;
  accountVoucherNo: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [voucherNo, setVoucherNo] = useState(accountVoucherNo);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const complete = Boolean(accountVoucherNo.trim());

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
      >
        Edit
      </button>
      <Modal
        open={open}
        title="Account Voucher No"
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
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
