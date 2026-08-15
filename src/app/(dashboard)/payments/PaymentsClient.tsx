"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { CustomerCategory } from "@/generated/prisma";
import {
  createPayment,
  deletePayment,
  updatePayment,
  type PaymentListResult,
  type PaymentRow,
} from "@/lib/actions/payments";
import {
  formatCustomerCategory,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { parsePartyKey, partyKey } from "@/lib/domain/paymentParty";
import { SearchableSelect } from "@/components/SearchableSelect";
import { PaymentsTabs } from "./PaymentsTabs";

type Opt = {
  id: string;
  name: string;
  kind: "customer" | "transporter";
  category?: CustomerCategory;
};
type Direction = "RECEIVED" | "SENT" | "";

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
    direction: "" as Direction,
    amount: "",
  };
}

function directionLabel(direction: string): string {
  return direction === "RECEIVED" ? "Fund Received" : "Fund Paid";
}

function pageHref(page: number): string {
  return page <= 1 ? "/payments" : `/payments?page=${page}`;
}

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function PaymentsClient({
  initial,
  parties,
}: {
  initial: PaymentListResult;
  parties: Opt[];
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages } = initial;

  const [form, setForm] = useState(() => emptyForm());
  const [editing, setEditing] = useState<PaymentRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const amountDisplay = useMemo(
    () => formatIndianAmountTyping(form.amount),
    [form.amount],
  );

  const partyOptions = useMemo(
    () =>
      parties.map((c) => ({
        value: partyKey(c.kind, c.id),
        label:
          c.kind === "transporter"
            ? `${c.name} — Transporter`
            : `${c.name} — ${formatCustomerCategory(c.category)}`,
        group: c.kind === "transporter" ? "Transporters" : "Customers",
      })),
    [parties],
  );

  function onAmountChange(value: string) {
    const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
    if (raw === "") {
      setForm({ ...form, amount: "" });
      return;
    }
    // One decimal point, max 2 fraction digits.
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
    setForm({ ...form, amount: raw });
  }

  function resetForm(partyId = "") {
    setEditing(null);
    setForm(emptyForm(partyId));
  }

  function startEdit(row: PaymentRow) {
    setEditing(row);
    setForm({
      date: row.date,
      partyId: row.transporterId
        ? partyKey("transporter", row.transporterId)
        : partyKey("customer", row.customerId ?? ""),
      direction: row.direction,
      amount: row.amount,
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
    if (!form.direction) {
      setError("Select Fund Received or Fund Paid");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than zero");
      return;
    }

    const party = parsePartyKey(form.partyId);
    const payload = {
      date: form.date,
      customerId: party.kind === "customer" ? party.id : null,
      transporterId: party.kind === "transporter" ? party.id : null,
      direction: form.direction,
      amount: form.amount,
    };

    startTransition(async () => {
      try {
        if (editing) {
          await updatePayment(editing.id, payload);
          resetForm();
          goToPage(page);
        } else {
          await createPayment(payload);
          resetForm();
          goToPage(1);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(row: PaymentRow) {
    if (!confirm(`Delete payment of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deletePayment(row.id);
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
        Record money received from or sent to customers.
      </p>

      <PaymentsTabs active="payment" />

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap">
        <table className="data payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Fund Received / Fund Paid</th>
              <th className="cell-num">Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="payment-entry-row">
              <td>
                <input
                  form="payment-entry-form"
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
                <SearchableSelect
                  form="payment-entry-form"
                  required
                  className="field-input"
                  ariaLabel="Customer or transporter"
                  placeholder="Search customer or transporter"
                  value={form.partyId}
                  onChange={(partyId) => setForm({ ...form, partyId })}
                  options={partyOptions}
                />
              </td>
              <td>
                <select
                  form="payment-entry-form"
                  required
                  className="field-input"
                  aria-label="Fund Received or Fund Paid"
                  value={form.direction}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      direction: e.target.value as Direction,
                    })
                  }
                >
                  <option value="">Select</option>
                  <option value="RECEIVED">Fund Received</option>
                  <option value="SENT">Fund Paid</option>
                </select>
              </td>
              <td className="cell-num payment-amount-cell">
                <input
                  form="payment-entry-form"
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
              <td className="space-x-2 whitespace-nowrap">
                <button
                  form="payment-entry-form"
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
                  <td>{directionLabel(row.direction)}</td>
                  <td className="cell-num">{formatRs(row.amount)}</td>
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
                <td colSpan={5}>No payments yet.</td>
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

      <form id="payment-entry-form" onSubmit={onSubmit} hidden />
    </div>
  );
}
