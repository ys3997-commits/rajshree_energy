"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  createBill,
  reviewBill,
  suggestNextApprovalNumber,
  type BillListResult,
  type BillRow,
} from "@/lib/actions/bills";
import { BILL_STATUS_LABEL, countRemarkWords, MAX_BILL_REMARK_WORDS, type BillStatus } from "@/lib/domain/bills";
import {
  capitalizeName,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { Modal } from "@/components/Modal";
import { OptionSelect } from "@/components/OptionSelect";
import { BillFilesCell } from "./BillFilesCell";
import { BillRemarkCell } from "./BillRemarkCell";
import { EditBillAccountVoucherButton } from "./EditBillAccountVoucherButton";

type ReviewAction = "APPROVED" | "REJECTED";

type BillQuery = {
  status: string;
  dateFrom: string;
  dateTo: string;
  approver: string;
  sentBy: string;
};

function pageHref(page: number, query: BillQuery): string {
  const params = new URLSearchParams();
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.dateFrom) params.set("dateFrom", query.dateFrom);
  if (query.dateTo) params.set("dateTo", query.dateTo);
  if (query.approver) params.set("approver", query.approver);
  if (query.sentBy) params.set("sentBy", query.sentBy);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/bills?${qs}` : "/bills";
}

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
  return {
    date: todayLocal(),
    invoiceIssuedBy: "",
    invoiceAmount: "",
    approverName: "",
    remark: "",
  };
}

export function BillsClient({
  initial,
  statusFilter,
  dateFrom,
  dateTo,
  approver,
  sentBy,
  owners,
  suggestedApprovalNo,
}: {
  initial: BillListResult;
  statusFilter: string;
  dateFrom: string;
  dateTo: string;
  approver: string;
  sentBy: string;
  owners: string[];
  suggestedApprovalNo: string;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, counts, senders, canUpload, isOwner } =
    initial;
  const activeStatus = statusFilter || "all";
  const query: BillQuery = {
    status: activeStatus,
    dateFrom,
    dateTo,
    approver,
    sentBy,
  };
  const hasExtraFilters = Boolean(dateFrom || dateTo || approver || sentBy);

  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [approvalNoPreview, setApprovalNoPreview] = useState(
    suggestedApprovalNo,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [reviewing, setReviewing] = useState<{
    row: BillRow;
    action: ReviewAction;
  } | null>(null);
  const [reviewRemark, setReviewRemark] = useState("");

  const senderOptions = useMemo(() => {
    if (!sentBy || senders.some((person) => person.id === sentBy)) return senders;
    return [{ id: sentBy, name: "Unknown" }, ...senders];
  }, [senders, sentBy]);

  const amountDisplay = useMemo(
    () => formatIndianAmountTyping(form.invoiceAmount),
    [form.invoiceAmount],
  );

  useEffect(() => {
    if (!canUpload) return;
    let cancelled = false;
    void suggestNextApprovalNumber(form.date).then((approvalNo) => {
      if (!cancelled) setApprovalNoPreview(approvalNo);
    });
    return () => {
      cancelled = true;
    };
  }, [canUpload, form.date]);

  function goTo(targetPage: number, next: BillQuery = query) {
    router.push(pageHref(targetPage, next));
    router.refresh();
  }

  function applyFilters(patch: Partial<BillQuery>) {
    goTo(1, { ...query, ...patch });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.invoiceIssuedBy.trim()) {
      setError("Invoice issued by is required");
      return;
    }
    if (!form.invoiceAmount || Number(form.invoiceAmount) <= 0) {
      setError("Invoice amount is required");
      return;
    }
    if (!form.approverName.trim()) {
      setError("Approver name is required");
      return;
    }
    if (!file) {
      setError("Document is required");
      return;
    }
    if (!form.remark.trim()) {
      setError("Doer remark is required");
      return;
    }
    if (countRemarkWords(form.remark) > MAX_BILL_REMARK_WORDS) {
      setError(
        `Doer remark must be at most ${MAX_BILL_REMARK_WORDS} words`,
      );
      return;
    }

    const data = new FormData();
    data.set("date", form.date);
    data.set("invoiceIssuedBy", form.invoiceIssuedBy);
    data.set("invoiceAmount", form.invoiceAmount);
    data.set("approverName", form.approverName);
    data.set("remark", form.remark);
    data.set("file", file);

    startTransition(async () => {
      try {
        await createBill(data);
        setForm(emptyForm());
        setFile(null);
        setFileKey((key) => key + 1);
        const nextApprovalNo = await suggestNextApprovalNumber(todayLocal());
        setApprovalNoPreview(nextApprovalNo);
        goTo(1, { ...query, status: "pending" });
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
    const remarkLabel =
      action === "APPROVED" ? "Approval remark" : "Rejection remark";
    if (countRemarkWords(reviewRemark) > MAX_BILL_REMARK_WORDS) {
      setError(
        `${remarkLabel} must be at most ${MAX_BILL_REMARK_WORDS} words`,
      );
      return;
    }

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
    <div className="approvals-page">
      <h1 className="page-title">Approvals</h1>
      {!canUpload ? (
        <p className="page-subtitle">
          Review staff submissions. Approve or reject each pending bill with a
          remark.
        </p>
      ) : null}

      {error && <div className="error-box">{error}</div>}

      {canUpload && (
        <form onSubmit={onSubmit} className="mb-6 form-grid">
          <label htmlFor="bill-approval-no">Approval no</label>
          <input
            id="bill-approval-no"
            className="field-input"
            readOnly
            value={approvalNoPreview}
            aria-readonly="true"
          />
          <label htmlFor="bill-date">Date</label>
          <input
            id="bill-date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <label htmlFor="bill-issued-by">
            Invoice issued by <span className="req" aria-hidden="true">*</span>
          </label>
          <input
            id="bill-issued-by"
            required
            value={form.invoiceIssuedBy}
            aria-required="true"
            onChange={(e) =>
              setForm({ ...form, invoiceIssuedBy: e.target.value })
            }
            onBlur={() => {
              const next = capitalizeName(form.invoiceIssuedBy);
              if (next) setForm({ ...form, invoiceIssuedBy: next });
            }}
          />
          <label htmlFor="bill-amount">
            Invoice amount <span className="req" aria-hidden="true">*</span>
          </label>
          <div className="field-with-unit field-with-prefix">
            <span className="field-unit">Rs</span>
            <input
              id="bill-amount"
              type="text"
              inputMode="decimal"
              required
              className="bill-amount-input"
              aria-required="true"
              placeholder="0.00"
              value={amountDisplay}
              onChange={(e) => {
                const raw = parseAmountInput(e.target.value).replace(
                  /[^\d.]/g,
                  "",
                );
                if (raw === "") {
                  setForm({ ...form, invoiceAmount: "" });
                  return;
                }
                if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
                setForm({ ...form, invoiceAmount: raw });
              }}
            />
          </div>
          <label htmlFor="bill-approver">
            Approver Name <span className="req" aria-hidden="true">*</span>
          </label>
          <OptionSelect
            id="bill-approver"
            required
            emptyLabel="Select owner"
            value={form.approverName}
            onChange={(approverName) => setForm({ ...form, approverName })}
            options={owners}
          />
          <label id="bill-file-label" htmlFor="bill-file">
            Document <span className="req" aria-hidden="true">*</span>
          </label>
          <div className="bill-file-field">
            <input
              id="bill-file"
              key={fileKey}
              ref={fileInputRef}
              className="bill-file-input-hidden"
              type="file"
              aria-required="true"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf,.jpg,.jpeg,.png,.webp,.gif"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
              }}
            />
            <button
              type="button"
              className={`field-input bill-file-trigger${
                file ? " has-file" : ""
              }`}
              aria-labelledby="bill-file-label"
              onClick={() => fileInputRef.current?.click()}
            >
              {file?.name ?? "Choose File"}
            </button>
          </div>
          <label htmlFor="bill-remark">Doer remark</label>
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
              {pending ? "Submitting…" : "Submit for approval"}
            </button>
          </div>
        </form>
      )}

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="bill-filter-from">
          Date from
          <input
            id="bill-filter-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => applyFilters({ dateFrom: e.target.value })}
          />
        </label>
        <label htmlFor="bill-filter-to">
          Date to
          <input
            id="bill-filter-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => applyFilters({ dateTo: e.target.value })}
          />
        </label>
        <label htmlFor="bill-filter-approver">
          Approver name
          <OptionSelect
            id="bill-filter-approver"
            emptyLabel="All"
            value={approver}
            onChange={(value) => applyFilters({ approver: value })}
            options={owners}
          />
        </label>
        {isOwner ? (
          <label htmlFor="bill-filter-sent-by">
            Sent by
            <select
              id="bill-filter-sent-by"
              value={sentBy}
              onChange={(e) => applyFilters({ sentBy: e.target.value })}
            >
              <option value="">All</option>
              {senderOptions.map((person) => (
                <option key={person.id} value={person.id}>
                  {capitalizeName(person.name) ?? person.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {hasExtraFilters ? (
          <Link
            href={pageHref(1, {
              status: activeStatus,
              dateFrom: "",
              dateTo: "",
              approver: "",
              sentBy: "",
            })}
            className="btn btn-secondary btn-sm"
            prefetch={false}
          >
            Clear
          </Link>
        ) : null}
      </form>

      <div className="ca-tabs" role="tablist" aria-label="Bill status">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={pageHref(1, { ...query, status: tab.key })}
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
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Approval No</th>
              <th>Date</th>
              <th>Invoice Issued By</th>
              <th className="cell-num">Invoice Amount</th>
              <th>Approver Name</th>
              <th>Sent By</th>
              <th>Document</th>
              <th>Doer Remark</th>
              <th>Status</th>
              <th>Owner Remark</th>
              <th>Account Voucher No</th>
              <th />
              {isOwner ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.approvalNo || "—"}</td>
                <td>{formatDateDdMmYyyy(row.date)}</td>
                <td>{row.invoiceIssuedBy || "—"}</td>
                <td className="cell-num">
                  {row.invoiceAmount ? formatRs(row.invoiceAmount) : "—"}
                </td>
                <td>
                  {row.approverName
                    ? (capitalizeName(row.approverName) ?? row.approverName)
                    : "—"}
                </td>
                <td>{row.staffName}</td>
                <td className="bill-files-cell">
                  <BillFilesCell files={row.files} />
                </td>
                <td>
                  <BillRemarkCell title="Doer remark" text={row.remark} />
                </td>
                <td>
                  <span
                    className={`bill-status bill-status-${row.status.toLowerCase()}`}
                  >
                    {BILL_STATUS_LABEL[row.status as BillStatus]}
                  </span>
                </td>
                <td>
                  <BillRemarkCell
                    title="Owner remark"
                    text={row.reviewRemark}
                  />
                </td>
                <td>{row.accountVoucherNo.trim() || "—"}</td>
                <td>
                  <EditBillAccountVoucherButton
                    billId={row.id}
                    accountVoucherNo={row.accountVoucherNo}
                  />
                </td>
                {isOwner ? (
                  <td className="space-x-2 whitespace-nowrap">
                    {row.status === "PENDING" || row.status === "REJECTED" ? (
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={pending}
                        onClick={() => openReview(row, "APPROVED")}
                      >
                        Approve
                      </button>
                    ) : null}
                    {row.status === "PENDING" ? (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={pending}
                        onClick={() => openReview(row, "REJECTED")}
                      >
                        Reject
                      </button>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={isOwner ? 13 : 12}>
                  {hasExtraFilters || activeStatus !== "all"
                    ? "No bills match these filters."
                    : "No bills yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {totalPages > 1 && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="payments-pagination-actions">
            {page > 1 && (
              <Link
                href={pageHref(page - 1, query)}
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
                href={pageHref(page + 1, query)}
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
              {reviewing.row.invoiceIssuedBy || "—"} ·{" "}
              {reviewing.row.invoiceAmount
                ? formatRs(reviewing.row.invoiceAmount)
                : "—"}{" "}
              · {reviewing.row.approverName || "—"} · {reviewing.row.staffName} ·{" "}
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
