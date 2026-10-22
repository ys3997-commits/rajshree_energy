"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import {
  createSavingAccountTxn,
  deleteSavingAccountTxn,
  updateSavingAccountTxn,
  type PaymentListResult,
  type PaymentRow,
} from "@/lib/actions/savingAccountTxns";
import {
  capitalizeName,
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import { FundFlowDateFilter } from "../FundFlowDateFilter";
import { FundFlowTotals } from "../FundFlowTotals";
import { paymentsHref } from "../paymentsHref";

type Direction = "RECEIVED" | "SENT" | "";
type FormState = {
  date: string;
  direction: Direction;
  bankAccountId: string;
  savingAccountName: string;
  amount: string;
};

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function emptyForm(): FormState {
  return {
    date: todayLocal(),
    direction: "" as Direction,
    bankAccountId: "",
    savingAccountName: "",
    amount: "",
  };
}

function formFromRow(row: PaymentRow): FormState {
  return {
    date: row.date,
    direction: row.direction,
    bankAccountId: row.bankAccountId ?? "",
    savingAccountName: row.savingAccountName,
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
    savingAccountName: "",
    amount: "",
  };
}

function accountLabel(
  accountName: string | null | undefined,
  bankName: string | null | undefined,
): string {
  if (!accountName) return "—";
  return bankName ? `${accountName} (${bankName})` : accountName;
}

function hasListFilters(
  dateFrom: string,
  dateTo: string,
  type: string,
  account: string,
): boolean {
  return Boolean(dateFrom || dateTo || type || account);
}

export function TxnSavingClient({
  initial,
  exportRows,
  accounts,
  dateFrom,
  dateTo,
  type,
  account,
}: {
  initial: PaymentListResult;
  exportRows: PaymentRow[];
  accounts: BankAccountBalanceRow[];
  dateFrom: string;
  dateTo: string;
  type: string;
  account: string;
}) {
  const router = useRouter();
  const { rows, total, page, pageSize, totalPages, totals } = initial;
  const listFilters = { dateFrom, dateTo, type, account };

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

  const downloadColumns = [
    { key: "date", header: "Date" },
    { key: "type", header: "Type" },
    { key: "account", header: "Account" },
    { key: "savingAccountName", header: "Saving Account Name" },
    { key: "amount", header: "Amount", align: "right" as const },
  ];
  const downloadRows = useMemo(
    () =>
      exportRows.map((row) => ({
        date: formatDateDdMmYyyy(row.date),
        type: directionLabel(row.direction),
        account: accountLabel(row.accountName, row.bankName),
        savingAccountName: row.savingAccountName,
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
    return {
      date: form.date,
      bankAccountId: form.bankAccountId,
      direction: form.direction,
      savingAccountName: form.savingAccountName,
      amount: form.amount,
    };
  }

  function validate(form: FormState): string | null {
    if (!form.direction) return "Select Fund Received or Fund Paid";
    if (!form.bankAccountId) return "Select an account";
    if (!form.savingAccountName.trim()) {
      return "Saving Account Name is required";
    }
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    return null;
  }

  function goToPage(targetPage: number) {
    router.push(
      paymentsHref({ section: "txn-saving", page: targetPage, ...listFilters }),
    );
    router.refresh();
  }

  function startEdit(row: PaymentRow) {
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
        await createSavingAccountTxn(payload);
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
        await updateSavingAccountTxn(id, payload);
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
    if (!confirm(`Delete transaction of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteSavingAccountTxn(row.id);
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
        <h1 className="page-title">Transaction with our saving a/c</h1>
        <TableDownloadButtons
          title="Transaction with our saving a/c"
          filenameBase="txn-saving-account"
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
          section="txn-saving"
          dateFrom={dateFrom}
          dateTo={dateTo}
          party=""
          type={type}
          account={account}
          accounts={accounts}
          parties={[]}
          hideParty
        />
      </div>

      {error && <div className="error-box">{error}</div>}

      <section className="extra-information" aria-label="Extra information">
        <h2 className="extra-information-title">Extra information</h2>
        {accounts.length === 0 ? (
          <p>No bank accounts yet. Add one under Masters → Bank → Create Bank Account.</p>
        ) : (
          <div className="detail-stat-row">
            {accounts.map((row) => {
              const selectedId = editingId
                ? editForm.bankAccountId
                : addForm.bankAccountId;
              const negative = Number(row.balance) < 0;
              return (
                <button
                  key={row.id}
                  type="button"
                  className="detail-stat"
                  aria-pressed={selectedId === row.id}
                  onClick={() => {
                    if (editingId) {
                      setEditForm({ ...editForm, bankAccountId: row.id });
                    } else {
                      setAddForm({ ...addForm, bankAccountId: row.id });
                    }
                  }}
                >
                  <span className="detail-stat-label">{row.accountName}</span>
                  <span className="extra-information-bank">{row.bankName}</span>
                  <span
                    className={
                      negative
                        ? "detail-stat-value fund-type-out"
                        : "detail-stat-value"
                    }
                  >
                    {formatRs(row.balance)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="table-wrap payments-table-wrap">
        <div className="table-h-scroll">
          <table className="data payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Account</th>
                <th>Saving Account Name</th>
                <th className="cell-num">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr className="payment-entry-row">
                <td>
                  <input
                    form="saving-add-form"
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
                  <select
                    form="saving-add-form"
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
                <td className="payment-account-cell">
                  <select
                    form="saving-add-form"
                    required
                    className="field-input"
                    aria-label="Account"
                    value={addForm.bankAccountId}
                    onChange={(e) =>
                      setAddForm({ ...addForm, bankAccountId: e.target.value })
                    }
                  >
                    <option value="">Select account</option>
                    {accounts.map((row) => (
                      <option key={row.id} value={row.id}>
                        {accountLabel(row.accountName, row.bankName)}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    form="saving-add-form"
                    type="text"
                    required
                    className="field-input"
                    aria-label="Saving Account Name"
                    value={addForm.savingAccountName}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        savingAccountName: e.target.value,
                      })
                    }
                    onBlur={() =>
                      setAddForm((form) => ({
                        ...form,
                        savingAccountName:
                          capitalizeName(form.savingAccountName) ??
                          form.savingAccountName,
                      }))
                    }
                  />
                </td>
                <td className="cell-num payment-amount-cell">
                  <input
                    form="saving-add-form"
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
                    form="saving-add-form"
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
                            form="saving-edit-form"
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
                          <select
                            form="saving-edit-form"
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
                        <td className="payment-account-cell">
                          <select
                            form="saving-edit-form"
                            required
                            className="field-input"
                            aria-label="Account"
                            value={editForm.bankAccountId}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                bankAccountId: e.target.value,
                              })
                            }
                          >
                            <option value="">Select account</option>
                            {accounts.map((acc) => (
                              <option key={acc.id} value={acc.id}>
                                {accountLabel(acc.accountName, acc.bankName)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            form="saving-edit-form"
                            type="text"
                            required
                            className="field-input"
                            aria-label="Saving Account Name"
                            value={editForm.savingAccountName}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                savingAccountName: e.target.value,
                              })
                            }
                            onBlur={() =>
                              setEditForm((form) => ({
                                ...form,
                                savingAccountName:
                                  capitalizeName(form.savingAccountName) ??
                                  form.savingAccountName,
                              }))
                            }
                          />
                        </td>
                        <td className="cell-num payment-amount-cell">
                          <input
                            form="saving-edit-form"
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
                        <td className={typeClass(row.direction)}>
                          {directionLabel(row.direction)}
                        </td>
                        <td>{accountLabel(row.accountName, row.bankName)}</td>
                        <td>{row.savingAccountName}</td>
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
                  <td colSpan={6}>
                    {hasListFilters(dateFrom, dateTo, type, account)
                      ? "No transactions match these filters."
                      : "No transactions yet."}
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
                href={paymentsHref({
                  section: "txn-saving",
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
                  section: "txn-saving",
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

      <form id="saving-add-form" onSubmit={onAdd} hidden />
      <form id="saving-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
