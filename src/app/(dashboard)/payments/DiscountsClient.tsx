"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { CustomerCategory } from "@/generated/prisma";
import {
  createDiscount,
  deleteDiscount,
  updateDiscount,
  type DiscountListResult,
  type DiscountRow,
} from "@/lib/actions/discounts";
import {
  formatCustomerCategory,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { parsePartyKey, partyKey } from "@/lib/domain/paymentParty";
import { PaymentsTabs } from "./PaymentsTabs";

type Opt = {
  id: string;
  name: string;
  kind: "customer" | "transporter";
  category?: CustomerCategory;
};
type Status = "RECEIVED" | "PAID" | "";

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyForm(partyId = "") {
  return {
    date: todayLocal(),
    partyId,
    status: "" as Status,
    amount: "",
    remarks: "",
  };
}

function statusLabel(status: string): string {
  return status === "RECEIVED" ? "Discount Received" : "Discount Paid";
}

function pageHref(page: number): string {
  const base = "/payments?tab=discount";
  return page <= 1 ? base : `${base}&page=${page}`;
}

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function DiscountsClient({
  initial,
  parties,
}: {
  initial: DiscountListResult;
  parties: Opt[];
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages } = initial;

  const [form, setForm] = useState(() => emptyForm());
  const [editing, setEditing] = useState<DiscountRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const amountDisplay = useMemo(
    () => formatIndianAmountTyping(form.amount),
    [form.amount],
  );

  function onAmountChange(value: string) {
    const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
    if (raw === "") {
      setForm({ ...form, amount: "" });
      return;
    }
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
    setForm({ ...form, amount: raw });
  }

  function resetForm(partyId = "") {
    setEditing(null);
    setForm(emptyForm(partyId));
  }

  function startEdit(row: DiscountRow) {
    setEditing(row);
    setForm({
      date: row.date,
      partyId: row.transporterId
        ? partyKey("transporter", row.transporterId)
        : partyKey("customer", row.customerId ?? ""),
      status: row.status,
      amount: row.amount,
      remarks: row.remarks,
    });
    setError(null);
  }

  function goToPage(targetPage: number) {
    router.push(pageHref(targetPage));
    router.refresh();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.partyId) {
      setError("Customer or transporter is required");
      return;
    }
    if (!form.status) {
      setError("Select Discount Received or Discount Paid");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }
    if (!form.remarks.trim()) {
      setError("Remarks are required");
      return;
    }

    const party = parsePartyKey(form.partyId);
    const payload = {
      date: form.date,
      customerId: party.kind === "customer" ? party.id : null,
      transporterId: party.kind === "transporter" ? party.id : null,
      status: form.status,
      amount: form.amount,
      remarks: form.remarks,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updateDiscount(editing.id, payload);
          resetForm();
          goToPage(page);
        } else {
          await createDiscount(payload);
          resetForm();
          goToPage(1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(row: DiscountRow) {
    if (!confirm(`Delete discount of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteDiscount(row.id);
        if (editing?.id === row.id) resetForm();
        const remainingOnPage = rows.length - 1;
        const nextPage =
          remainingOnPage === 0 && page > 1 ? page - 1 : page;
        goToPage(nextPage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div>
      <h1 className="page-title">Payments</h1>
      <p className="page-subtitle">
        Record discounts received from or paid to customers.
      </p>

      <PaymentsTabs active="discount" />

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
        <table className="data payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="cell-num">Amount</th>
              <th>Remarks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="payment-entry-row">
              <td>
                <input
                  form="discount-entry-form"
                  type="date"
                  required
                  className="field-input"
                  aria-label="Date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                />
              </td>
              <td>
                <select
                  form="discount-entry-form"
                  required
                  className="field-input"
                  aria-label="Customer or transporter"
                  value={form.partyId}
                  onChange={(e) =>
                    setForm({ ...form, partyId: e.target.value })
                  }
                >
                  <option value="">Select customer or transporter</option>
                  <optgroup label="Customers">
                    {parties
                      .filter((c) => c.kind === "customer")
                      .map((c) => (
                        <option
                          key={partyKey("customer", c.id)}
                          value={partyKey("customer", c.id)}
                        >
                          {c.name} — {formatCustomerCategory(c.category)}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Transporters">
                    {parties
                      .filter((c) => c.kind === "transporter")
                      .map((c) => (
                        <option
                          key={partyKey("transporter", c.id)}
                          value={partyKey("transporter", c.id)}
                        >
                          {c.name} — Transporter
                        </option>
                      ))}
                  </optgroup>
                </select>
              </td>
              <td>
                <select
                  form="discount-entry-form"
                  required
                  className="field-input"
                  aria-label="Status"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as Status,
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="RECEIVED">Discount Received</option>
                  <option value="PAID">Discount Paid</option>
                </select>
              </td>
              <td className="cell-num payment-amount-cell">
                <input
                  form="discount-entry-form"
                  type="text"
                  inputMode="decimal"
                  required
                  className="field-input"
                  placeholder="0.00"
                  aria-label="Amount"
                  value={amountDisplay}
                  onChange={(e) => onAmountChange(e.target.value)}
                />
              </td>
              <td>
                <input
                  form="discount-entry-form"
                  type="text"
                  required
                  className="field-input"
                  placeholder="Write remarks…"
                  aria-label="Remarks"
                  value={form.remarks}
                  onChange={(e) =>
                    setForm({ ...form, remarks: e.target.value })
                  }
                />
              </td>
              <td className="space-x-2 whitespace-nowrap">
                <button
                  form="discount-entry-form"
                  type="submit"
                  className="btn btn-sm"
                  disabled={pending}
                >
                  {editing ? "Update" : "Add"}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => resetForm()}
                    disabled={pending}
                  >
                    Cancel
                  </button>
                )}
              </td>
            </tr>

            {rows.map((row, index) => {
              const prevDate = index > 0 ? rows[index - 1].date : null;
              const dateBreak = prevDate != null && prevDate !== row.date;
              return (
                <tr
                  key={row.id}
                  className={dateBreak ? "payment-date-break" : undefined}
                >
                  <td>{formatDateDdMmYyyy(row.date)}</td>
                  <td>
                    {row.transporterId
                      ? `${row.customerName} — Transporter`
                      : row.customerName}
                  </td>
                  <td>{statusLabel(row.status)}</td>
                  <td className="cell-num">{formatRs(row.amount)}</td>
                  <td>{row.remarks || "—"}</td>
                  <td className="space-x-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => startEdit(row)}
                      disabled={pending}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(row)}
                      disabled={pending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6}>No discounts yet.</td>
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
                href={pageHref(page - 1)}
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
                href={pageHref(page + 1)}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <form id="discount-entry-form" onSubmit={onSubmit} hidden />
    </div>
  );
}
