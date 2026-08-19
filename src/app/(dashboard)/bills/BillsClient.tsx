"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createBill,
  reviewBill,
  type BillListResult,
  type BillRow,
} from "@/lib/actions/bills";
import { BILL_STATUS_LABEL, type BillStatus } from "@/lib/domain/bills";
import { Modal } from "@/components/Modal";

type ReviewAction = "APPROVED" | "REJECTED";

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function emptyForm() {
  return { date: todayLocal(), remark: "" };
}

function pageHref(page: number, status: string): string {
  const params = new URLSearchParams();
  if (status && status !== "all") params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/bills?${query}` : "/bills";
}

export function BillsClient({
  initial,
  statusFilter,
}: {
  initial: BillListResult;
  statusFilter: string;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, counts, canUpload, isOwner } =
    initial;
  const activeStatus = statusFilter || "all";

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [reviewing, setReviewing] = useState<{
    row: BillRow;
    action: ReviewAction;
  } | null>(null);
  const [reviewRemark, setReviewRemark] = useState("");

  function goTo(targetPage: number, status = activeStatus) {
    router.push(pageHref(targetPage, status));
    router.refresh();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("File is required");
      return;
    }

    const data = new FormData();
    data.set("date", form.date);
    data.set("remark", form.remark);
    data.set("file", file);

    startTransition(async () => {
      try {
        await createBill(data);
        setForm(emptyForm());
        setFile(null);
        setFileKey((key) => key + 1);
        goTo(1, "pending");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  function openReview(row: BillRow, action: ReviewAction) {
    setReviewing({ row, action });
    setReviewRemark("");
    setError(null);
  }

  function onReview(e: FormEvent) {
    e.preventDefault();
    if (!reviewing) return;
    setError(null);
    const { row, action } = reviewing;

    startTransition(async () => {
      try {
        await reviewBill(row.id, action, reviewRemark);
        setReviewing(null);
        setReviewRemark("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Review failed");
      }
    });
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const tabs: { key: string; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "approved", label: "Approved", count: counts.approved },
    { key: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div>
      <h1 className="page-title">Bills</h1>
      <p className="page-subtitle">
        {canUpload
          ? "Upload a bill for the owner to approve. Rejected bills stay on record — upload a new file if you need to send it again."
          : "Review staff bill uploads. Approve or reject each pending bill with a remark."}
      </p>

      {error && <div className="error-box">{error}</div>}

      {canUpload && (
        <form onSubmit={onSubmit} className="mb-6 form-grid">
          <label htmlFor="bill-date">Date</label>
          <input
            id="bill-date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <label htmlFor="bill-file">File</label>
          <input
            id="bill-file"
            key={fileKey}
            type="file"
            required
            accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <label htmlFor="bill-remark">Remark</label>
          <textarea
            id="bill-remark"
            required
            rows={3}
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
          />
          <div />
          <div>
            <button type="submit" className="btn" disabled={pending}>
              {pending ? "Uploading…" : "Upload bill"}
            </button>
          </div>
        </form>
      )}

      <div className="ca-tabs" role="tablist" aria-label="Bill status">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={pageHref(1, tab.key)}
            role="tab"
            aria-selected={activeStatus === tab.key}
            className={
              activeStatus === tab.key ? "ca-tab ca-tab-active" : "ca-tab"
            }
            prefetch={false}
          >
            {tab.label}
            <span className="ca-tab-count">{tab.count}</span>
          </Link>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sent by</th>
              <th>File</th>
              <th>Remark</th>
              <th>Status</th>
              <th>Owner remark</th>
              {isOwner ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{formatDateDdMmYyyy(row.date)}</td>
                <td>{row.staffName}</td>
                <td>
                  <a
                    href={`/api/bills/${row.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="bill-file-link"
                  >
                    {row.fileName}
                  </a>
                </td>
                <td>{row.remark}</td>
                <td>
                  <span
                    className={`bill-status bill-status-${row.status.toLowerCase()}`}
                  >
                    {BILL_STATUS_LABEL[row.status as BillStatus]}
                  </span>
                </td>
                <td>{row.reviewRemark || "—"}</td>
                {isOwner ? (
                  <td className="space-x-2 whitespace-nowrap">
                    {row.status === "PENDING" ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={pending}
                          onClick={() => openReview(row, "APPROVED")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={pending}
                          onClick={() => openReview(row, "REJECTED")}
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={isOwner ? 7 : 6}>No bills yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="payments-pagination-actions">
            {page > 1 && (
              <Link
                href={pageHref(page - 1, activeStatus)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Previous
              </Link>
            )}
            <span>
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={pageHref(page + 1, activeStatus)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <Modal
        open={Boolean(reviewing)}
        title={
          reviewing?.action === "APPROVED" ? "Approve bill" : "Reject bill"
        }
        onClose={() => {
          if (!pending) setReviewing(null);
        }}
      >
        {reviewing ? (
          <form onSubmit={onReview} className="form-grid form-grid-plain">
            <p className="bill-review-meta">
              {reviewing.row.fileName} · {reviewing.row.staffName} ·{" "}
              {formatDateDdMmYyyy(reviewing.row.date)}
            </p>
            <label htmlFor="bill-review-remark">
              {reviewing.action === "APPROVED"
                ? "Approval remark"
                : "Rejection remark"}
            </label>
            <textarea
              id="bill-review-remark"
              required
              rows={4}
              value={reviewRemark}
              onChange={(e) => setReviewRemark(e.target.value)}
            />
            <div />
            <div className="flex gap-2">
              <button type="submit" className="btn" disabled={pending}>
                {pending
                  ? "Saving…"
                  : reviewing.action === "APPROVED"
                    ? "Approve"
                    : "Reject"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={pending}
                onClick={() => setReviewing(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
