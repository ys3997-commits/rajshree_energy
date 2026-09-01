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
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { FundFlowDateFilter } from "./FundFlowDateFilter";
import { FundFlowTotals } from "./FundFlowTotals";
import { PartyNameLink } from "./PartyNameLink";
import { paymentsHref } from "./paymentsHref";

type Opt = {
  id: string;
  name: string;
  kind: "customer" | "transporter";
  category?: CustomerCategory;
};
type Direction = "RECEIVED" | "SENT" | "";
type FormState = {
  date: string;
  partyId: string;
  direction: Direction;
  amount: string;
};

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyForm(partyId = ""): FormState {
  return {
    date: todayLocal(),
    partyId,
    direction: "" as Direction,
    amount: "",
  };
}

function formFromRow(row: PaymentRow): FormState {
  return {
    date: row.date,
    partyId: row.transporterId
      ? partyKey("transporter", row.transporterId)
      : partyKey("customer", row.customerId ?? ""),
    direction: row.direction,
    amount: row.amount,
  };
}

function directionLabel(direction: string): string {
  return direction === "RECEIVED" ? "Fund Received" : "Fund Paid";
}

function typeClass(direction: string): string {
  return direction === "RECEIVED" ? "fund-type-in" : "fund-type-out";
}

function rowTypeClass(direction: string): string {
  return direction === "RECEIVED" ? "fund-row-in" : "fund-row-out";
}

const EDIT_LOCK_HINT =
  "Staff can edit/delete only entries they created on the same day.";

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function resetAddFormAfterSave(form: FormState): FormState {
  return {
    ...form,
    direction: "" as Direction,
    amount: "",
  };
}

function partyLabel(row: PaymentRow): string {
  return row.transporterId
    ? `${row.customerName} — Transporter`
    : row.customerName;
}

function hasListFilters(
  dateFrom: string,
  dateTo: string,
  party: string,
  type: string,
): boolean {
  return Boolean(dateFrom || dateTo || party || type);
}

export function PaymentsClient({
  initial,
  exportRows,
  parties,
  dateFrom,
  dateTo,
  party,
  type,
}: {
  initial: PaymentListResult;
  exportRows: PaymentRow[];
  parties: Opt[];
  dateFrom: string;
  dateTo: string;
  party: string;
  type: string;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, totals } = initial;
  const listFilters = { dateFrom, dateTo, party, type };

  const [addForm, setAddForm] = useState(() => emptyForm());
  const [editForm, setEditForm] = useState<FormState>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const addAmountDisplay = useMemo(
    () => formatIndianAmountTyping(addForm.amount),
    [addForm.amount],
  );
  const editAmountDisplay = useMemo(
    () => formatIndianAmountTyping(editForm.amount),
    [editForm.amount],
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

  const downloadColumns = [
    { key: "date", header: "Date" },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Type" },
    { key: "amount", header: "Amount", align: "right" as const },
  ];
  const downloadRows = useMemo(
    () =>
      exportRows.map((row) => ({
        date: formatDateDdMmYyyy(row.date),
        customer: partyLabel(row),
        type: directionLabel(row.direction),
        amount: formatRs(row.amount),
      })),
    [exportRows],
  );

  function changeAmount(form: FormState, value: string): FormState | null {
    const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
    if (raw === "") return { ...form, amount: "" };
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return null;
    return { ...form, amount: raw };
  }

  function payloadFrom(form: FormState) {
    const party = parsePartyKey(form.partyId);
    return {
      date: form.date,
      customerId: party.kind === "customer" ? party.id : null,
      transporterId: party.kind === "transporter" ? party.id : null,
      direction: form.direction,
      amount: form.amount,
    };
  }

  function validate(form: FormState): string | null {
    if (!form.partyId) return "Customer or transporter is required";
    if (!form.direction) return "Select Fund Received or Fund Paid";
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    return null;
  }

  function goToPage(targetPage: number) {
    router.push(
      paymentsHref({ section: "transactions", page: targetPage, ...listFilters }),
    );
    router.refresh();
  }

  function startEdit(row: PaymentRow) {
    // Defer so the Edit click is not delivered to Update/Cancel, which
    // appear in the same place and would close edit mode immediately.
    window.setTimeout(() => {
      setEditingId(row.id);
      setEditForm(formFromRow(row));
      setError(null);
    }, 0);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm());
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const message = validate(addForm);
    if (message) {
      setError(message);
      return;
    }
    const payload = payloadFrom(addForm);
    startTransition(async () => {
      try {
        await createPayment(payload);
        setAddForm((prev) => resetAddFormAfterSave(prev));
        goToPage(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    const message = validate(editForm);
    if (message) {
      setError(message);
      return;
    }
    const payload = payloadFrom(editForm);
    const id = editingId;
    startTransition(async () => {
      try {
        await updatePayment(id, payload);
        cancelEdit();
        goToPage(page);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onUpdate(e: FormEvent) {
    e.preventDefault();
    saveEdit();
  }

  function onDelete(row: PaymentRow) {
    if (!confirm(`Delete payment of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deletePayment(row.id);
        if (editingId === row.id) cancelEdit();
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
      <div className="page-header">
        <h1 className="page-title">Transactions</h1>
        <TableDownloadButtons
          title="Transactions"
          filenameBase="fund-flow-transactions"
          columns={downloadColumns}
          rows={downloadRows}
        />
      </div>

      {totals ? (
        <FundFlowTotals
          receivedLabel="Fund received"
          paidLabel="Fund paid"
          received={totals.received}
          paid={totals.paid}
          net={totals.net}
        />
      ) : null}

      <div className="filters">
        <FundFlowDateFilter
          section="transactions"
          dateFrom={dateFrom}
          dateTo={dateTo}
          party={party}
          type={type}
          parties={parties}
        />
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrap payments-table-wrap">
        <div className="table-h-scroll"><table className="data payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th className="cell-num">Amount</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr className="payment-entry-row">
              <td>
                <input
                  form="payment-add-form"
                  type="date"
                  required
                  className="field-input"
                  aria-label="Date"
                  value={addForm.date}
                  onChange={(e) =>
                    setAddForm({ ...addForm, date: e.target.value })
                  }
                />
              </td>
              <td>
                <SearchableSelect
                  form="payment-add-form"
                  required
                  className="field-input"
                  ariaLabel="Customer or transporter"
                  placeholder="Search customer or transporter"
                  value={addForm.partyId}
                  onChange={(partyId) => setAddForm({ ...addForm, partyId })}
                  options={partyOptions}
                />
              </td>
              <td>
                <select
                  form="payment-add-form"
                  required
                  className="field-input"
                  aria-label="Type"
                  value={addForm.direction}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
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
                  form="payment-add-form"
                  type="text"
                  inputMode="decimal"
                  required
                  className="field-input"
                  placeholder="0.00"
                  aria-label="Amount"
                  value={addAmountDisplay}
                  onChange={(e) => {
                    const next = changeAmount(addForm, e.target.value);
                    if (next) setAddForm(next);
                  }}
                />
              </td>
              <td className="space-x-2 whitespace-nowrap">
                <button
                  form="payment-add-form"
                  type="submit"
                  className="btn btn-sm"
                  disabled={pending || editingId != null}
                >
                  Add
                </button>
              </td>
            </tr>

            {rows.map((row, index) => {
              const prevDate = index > 0 ? rows[index - 1].date : null;
              const dateBreak = prevDate != null && prevDate !== row.date;
              const isEditing = editingId === row.id;
              return (
                <tr
                  key={row.id}
                  className={[
                    dateBreak ? "payment-date-break" : "",
                    isEditing ? "payment-editing-row" : "",
                    rowTypeClass(row.direction),
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                >
                  {isEditing ? (
                    <>
                      <td>
                        <input
                          form="payment-edit-form"
                          type="date"
                          required
                          className="field-input"
                          aria-label="Date"
                          value={editForm.date}
                          onChange={(e) =>
                            setEditForm({ ...editForm, date: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <SearchableSelect
                          form="payment-edit-form"
                          required
                          className="field-input"
                          ariaLabel="Customer or transporter"
                          placeholder="Search customer or transporter"
                          value={editForm.partyId}
                          onChange={(partyId) =>
                            setEditForm({ ...editForm, partyId })
                          }
                          options={partyOptions}
                        />
                      </td>
                      <td>
                        <select
                          form="payment-edit-form"
                          required
                          className="field-input"
                          aria-label="Type"
                          value={editForm.direction}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              direction: e.target.value as Direction,
                            })
                          }
                        >
                          <option value="RECEIVED">Fund Received</option>
                          <option value="SENT">Fund Paid</option>
                        </select>
                      </td>
                      <td className="cell-num payment-amount-cell">
                        <input
                          form="payment-edit-form"
                          type="text"
                          inputMode="decimal"
                          required
                          className="field-input"
                          placeholder="0.00"
                          aria-label="Amount"
                          value={editAmountDisplay}
                          onChange={(e) => {
                            const next = changeAmount(editForm, e.target.value);
                            if (next) setEditForm(next);
                          }}
                        />
                      </td>
                      <td className="space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={saveEdit}
                          disabled={pending}
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEdit}
                          disabled={pending}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{formatDateDdMmYyyy(row.date)}</td>
                      <td>
                        <PartyNameLink
                          customerId={row.customerId}
                          transporterId={row.transporterId}
                          name={row.customerName}
                        />
                      </td>
                      <td className={typeClass(row.direction)}>
                        {directionLabel(row.direction)}
                      </td>
                      <td className={`cell-num ${typeClass(row.direction)}`}>
                        {formatRs(row.amount)}
                      </td>
                      <td className="space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEdit(row)}
                          disabled={pending || !row.canEdit}
                          title={row.canEdit ? undefined : EDIT_LOCK_HINT}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(row)}
                          disabled={pending || !row.canDelete}
                          title={row.canDelete ? undefined : EDIT_LOCK_HINT}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>
                  {hasListFilters(dateFrom, dateTo, party, type)
                    ? "No payments match these filters."
                    : "No payments yet."}
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
                href={paymentsHref({
                  section: "transactions",
                  page: page - 1,
                  ...listFilters,
                })}
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
                href={paymentsHref({
                  section: "transactions",
                  page: page + 1,
                  ...listFilters,
                })}
                className="btn btn-secondary btn-sm"
                prefetch={false}
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}

      <form id="payment-add-form" onSubmit={onAdd} hidden />
      <form id="payment-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
