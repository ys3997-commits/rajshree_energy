"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createVegPayment,
  deleteVegPayment,
  updateVegPayment,
  type VegPaymentListResult,
  type VegPaymentRow,
} from "@/lib/actions/vegPayments";
import type { VegListRow } from "@/lib/actions/veg";
import {
  capitalizeName,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { SearchableSelect } from "@/components/SearchableSelect";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { VegFlowDateFilter } from "./VegFlowDateFilter";
import { vegHref } from "./vegHref";

type FormState = {
  date: string;
  vegId: string;
  amount: string;
};

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyForm(vegId = ""): FormState {
  return { date: todayLocal(), vegId, amount: "" };
}

function formFromRow(row: VegPaymentRow): FormState {
  return { date: row.date, vegId: row.vegId, amount: row.amount };
}

function vegLabel(row: { customerName: string; vegName: string }): string {
  const customer = capitalizeName(row.customerName) ?? row.customerName;
  const name = capitalizeName(row.vegName) ?? row.vegName;
  return `${customer} — ${name}`;
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
  return { ...form, amount: "" };
}

function hasListFilters(dateFrom: string, dateTo: string, party: string): boolean {
  return Boolean(dateFrom || dateTo || party);
}

export function VegPaymentsClient({
  initial,
  exportRows,
  vegs,
  dateFrom,
  dateTo,
  party,
}: {
  initial: VegPaymentListResult;
  exportRows: VegPaymentRow[];
  vegs: VegListRow[];
  dateFrom: string;
  dateTo: string;
  party: string;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, totals } = initial;
  const listFilters = { dateFrom, dateTo, party };

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

  const vegOptions = useMemo(
    () =>
      vegs.map((veg) => {
        const customer = capitalizeName(veg.customerName) ?? veg.customerName;
        const name = capitalizeName(veg.name) ?? veg.name;
        return {
          value: veg.id,
          label: `${customer} — ${name}`,
          group: customer,
        };
      }),
    [vegs],
  );

  const downloadColumns = [
    { key: "date", header: "Date" },
    { key: "customer", header: "Customer" },
    { key: "veg", header: "Veg name" },
    { key: "type", header: "Type" },
    { key: "amount", header: "Amount", align: "right" as const },
  ];
  const downloadRows = useMemo(
    () =>
      exportRows.map((row) => ({
        date: formatDateDdMmYyyy(row.date),
        customer: capitalizeName(row.customerName) ?? row.customerName,
        veg: capitalizeName(row.vegName) ?? row.vegName,
        type: "Fund Paid",
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

  function validate(form: FormState): string | null {
    if (!form.vegId) return "Veg is required";
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    return null;
  }

  function goToPage(targetPage: number) {
    router.push(
      vegHref({ section: "payment", page: targetPage, ...listFilters }),
    );
    router.refresh();
  }

  function startEdit(row: VegPaymentRow) {
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
    const payload = {
      date: addForm.date,
      vegId: addForm.vegId,
      amount: addForm.amount,
    };
    startTransition(async () => {
      try {
        await createVegPayment(payload);
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
    const payload = {
      date: editForm.date,
      vegId: editForm.vegId,
      amount: editForm.amount,
    };
    const id = editingId;
    startTransition(async () => {
      try {
        await updateVegPayment(id, payload);
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

  function onDelete(row: VegPaymentRow) {
    if (!confirm(`Delete veg payment of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteVegPayment(row.id);
        if (editingId === row.id) cancelEdit();
        const remainingOnPage = rows.length - 1;
        const nextPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
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
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Veg
            <span aria-hidden="true"> · </span>
            Veg Payment
          </p>
          <h1 className="page-title">Veg Payment</h1>
          <p className="page-subtitle">
            Fund paid to industry veg contacts. Fund received is not used here.
          </p>
        </div>
        <TableDownloadButtons
          title="Veg Payment"
          filenameBase="veg-payment"
          columns={downloadColumns}
          rows={downloadRows}
        />
      </div>

      {totals ? (
        <div className="detail-stat-row fund-flow-totals">
          <div className="detail-stat">
            <span className="detail-stat-label">Fund paid</span>
            <span className="detail-stat-value fund-type-out">
              {formatRs(totals.paid)}
            </span>
          </div>
        </div>
      ) : null}

      <div className="filters">
        <VegFlowDateFilter
          section="payment"
          dateFrom={dateFrom}
          dateTo={dateTo}
          party={party}
          type=""
          vegs={vegs}
        />
      </div>

      {error && <div className="error-box">{error}</div>}

      {vegs.length === 0 ? (
        <p className="page-subtitle">
          Add veg contacts in Masters → Veg before recording payments.
        </p>
      ) : null}

      <div className="table-wrap payments-table-wrap">
        <div className="table-h-scroll">
          <table className="data payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Veg</th>
                <th>Type</th>
                <th className="cell-num">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr className="payment-entry-row">
                <td>
                  <input
                    form="veg-payment-add-form"
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
                    form="veg-payment-add-form"
                    required
                    className="field-input"
                    ariaLabel="Veg contact"
                    placeholder="Search customer or veg"
                    value={addForm.vegId}
                    onChange={(vegId) => setAddForm({ ...addForm, vegId })}
                    options={vegOptions}
                  />
                </td>
                <td>
                  <span className="veg-type-static fund-type-out">
                    Fund Paid
                  </span>
                </td>
                <td className="cell-num payment-amount-cell">
                  <input
                    form="veg-payment-add-form"
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
                    form="veg-payment-add-form"
                    type="submit"
                    className="btn btn-sm"
                    disabled={pending || editingId != null || vegs.length === 0}
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
                      "fund-row-out",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            form="veg-payment-edit-form"
                            type="date"
                            required
                            className="field-input"
                            aria-label="Date"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                date: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td>
                          <SearchableSelect
                            form="veg-payment-edit-form"
                            required
                            className="field-input"
                            ariaLabel="Veg contact"
                            placeholder="Search customer or veg"
                            value={editForm.vegId}
                            onChange={(vegId) =>
                              setEditForm({ ...editForm, vegId })
                            }
                            options={vegOptions}
                          />
                        </td>
                        <td>
                          <span className="veg-type-static fund-type-out">
                            Fund Paid
                          </span>
                        </td>
                        <td className="cell-num payment-amount-cell">
                          <input
                            form="veg-payment-edit-form"
                            type="text"
                            inputMode="decimal"
                            required
                            className="field-input"
                            placeholder="0.00"
                            aria-label="Amount"
                            value={editAmountDisplay}
                            onChange={(e) => {
                              const next = changeAmount(
                                editForm,
                                e.target.value,
                              );
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
                        <td>{vegLabel(row)}</td>
                        <td className="fund-type-out">Fund Paid</td>
                        <td className="cell-num fund-type-out">
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
                    {hasListFilters(dateFrom, dateTo, party)
                      ? "No veg payments match these filters."
                      : "No veg payments yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="payments-pagination">
          <span>
            {from}–{to} of {total}
          </span>
          <div className="payments-pagination-actions">
            {page > 1 && (
              <Link
                href={vegHref({
                  section: "payment",
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
                href={vegHref({
                  section: "payment",
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

      <form id="veg-payment-add-form" onSubmit={onAdd} hidden />
      <form id="veg-payment-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
