"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import {
  createBookExpense,
  deleteBookExpense,
  updateBookExpense,
  type BookExpenseRow,
} from "@/lib/actions/bookExpenses";
import {
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";

type AccountOption = BankAccountBalanceRow;
type ExpenseOption = { id: string; name: string };

type FormState = {
  date: string;
  paidAccountId: string;
  indirectExpenseId: string;
  amount: string;
  particular: string;
};

const EDIT_LOCK_HINT =
  "Staff can edit/delete only entries they created on the same day.";

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
    paidAccountId: "",
    indirectExpenseId: "",
    amount: "",
    particular: "",
  };
}

function formFromRow(row: BookExpenseRow): FormState {
  return {
    date: row.date,
    paidAccountId: row.paidAccountId,
    indirectExpenseId: row.indirectExpenseId,
    amount: row.amount,
    particular: row.particular,
  };
}

function formatDateDdMmYyyy(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim().slice(0, 10));
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

export function BookExpensesClient({
  accounts,
  expenses,
  initial,
}: {
  accounts: AccountOption[];
  expenses: ExpenseOption[];
  initial: BookExpenseRow[];
}) {
  const router = useRouter();
  const [addForm, setAddForm] = useState<FormState>(() => emptyForm());
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

  function changeAmount(form: FormState, value: string): FormState | null {
    const raw = parseAmountInput(value).replace(/[^\d.]/g, "");
    if (raw === "") return { ...form, amount: "" };
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return null;
    return { ...form, amount: raw };
  }

  function validate(form: FormState): string | null {
    if (!form.date) return "Date is required";
    if (!form.paidAccountId) return "Select a fund paid account";
    if (!form.indirectExpenseId) return "Select an indirect expense";
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
    if (!form.particular.trim()) return "Particular is required";
    return null;
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const message = validate(addForm);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await createBookExpense(addForm);
        setAddForm({
          ...emptyForm(),
          date: addForm.date,
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: BookExpenseRow) {
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

  function saveEdit() {
    if (!editingId) return;
    const message = validate(editForm);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await updateBookExpense(editingId, editForm);
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onUpdate(e: FormEvent) {
    e.preventDefault();
    saveEdit();
  }

  function onDelete(row: BookExpenseRow) {
    if (!confirm(`Delete expense of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteBookExpense(row.id);
        if (editingId === row.id) cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function accountSelect(
    formId: string,
    label: string,
    value: string,
    options: AccountOption[],
    onChange: (id: string) => void,
  ) {
    return (
      <select
        form={formId}
        required
        className="field-input"
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select account</option>
        {options.map((account) => (
          <option key={account.id} value={account.id}>
            {account.accountName}
          </option>
        ))}
      </select>
    );
  }

  function expenseSelect(
    formId: string,
    value: string,
    onChange: (id: string) => void,
  ) {
    return (
      <select
        form={formId}
        required
        className="field-input"
        aria-label="Indirect Expenses"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select expense</option>
        {expenses.map((expense) => (
          <option key={expense.id} value={expense.id}>
            {expense.name}
          </option>
        ))}
      </select>
    );
  }

  const activeForm = editingId ? editForm : addForm;

  function pickAccount(accountId: string) {
    if (editingId) {
      setEditForm((form) => ({ ...form, paidAccountId: accountId }));
    } else {
      setAddForm((form) => ({ ...form, paidAccountId: accountId }));
    }
  }

  return (
    <div>
      <h1 className="page-title">Expenses</h1>
      {error && <div className="error-box">{error}</div>}

      <section className="extra-information" aria-label="Extra information">
        <h2 className="extra-information-title">Extra information</h2>
        {accounts.length === 0 ? (
          <p>No bank accounts yet. Add one under Masters → Bank → Create Bank Account.</p>
        ) : (
          <div className="detail-stat-row">
            {accounts.map((account) => {
              const selected = activeForm.paidAccountId === account.id;
              const negative = Number(account.balance) < 0;
              return (
                <button
                  key={account.id}
                  type="button"
                  className="detail-stat"
                  aria-pressed={selected}
                  onClick={() => pickAccount(account.id)}
                >
                  <span className="detail-stat-label">{account.accountName}</span>
                  <span className="extra-information-bank">{account.bankName}</span>
                  <span
                    className={
                      negative
                        ? "detail-stat-value fund-type-out"
                        : "detail-stat-value"
                    }
                  >
                    {formatRs(account.balance)}
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
                <th>Fund paid</th>
                <th>Indirect Expenses</th>
                <th className="cell-num">Amount</th>
                <th>Particular</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr className="payment-entry-row">
                <td>
                  <input
                    form="expense-add-form"
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
                <td className="payment-account-cell">
                  {accountSelect(
                    "expense-add-form",
                    "Fund paid",
                    addForm.paidAccountId,
                    accounts,
                    (paidAccountId) => setAddForm({ ...addForm, paidAccountId }),
                  )}
                </td>
                <td className="payment-account-cell">
                  {expenseSelect(
                    "expense-add-form",
                    addForm.indirectExpenseId,
                    (indirectExpenseId) =>
                      setAddForm({ ...addForm, indirectExpenseId }),
                  )}
                </td>
                <td className="cell-num payment-amount-cell">
                  <input
                    form="expense-add-form"
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
                <td>
                  <input
                    form="expense-add-form"
                    type="text"
                    required
                    className="field-input"
                    aria-label="Particular"
                    value={addForm.particular}
                    onChange={(e) =>
                      setAddForm({ ...addForm, particular: e.target.value })
                    }
                  />
                </td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    form="expense-add-form"
                    type="submit"
                    className="btn btn-sm"
                    disabled={
                      pending ||
                      editingId != null ||
                      accounts.length < 1 ||
                      expenses.length < 1
                    }
                  >
                    Add
                  </button>
                </td>
              </tr>

              {initial.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <tr
                    key={row.id}
                    className={isEditing ? "payment-editing-row" : undefined}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            form="expense-edit-form"
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
                        <td className="payment-account-cell">
                          {accountSelect(
                            "expense-edit-form",
                            "Fund paid",
                            editForm.paidAccountId,
                            accounts,
                            (paidAccountId) =>
                              setEditForm({ ...editForm, paidAccountId }),
                          )}
                        </td>
                        <td className="payment-account-cell">
                          {expenseSelect(
                            "expense-edit-form",
                            editForm.indirectExpenseId,
                            (indirectExpenseId) =>
                              setEditForm({ ...editForm, indirectExpenseId }),
                          )}
                        </td>
                        <td className="cell-num payment-amount-cell">
                          <input
                            form="expense-edit-form"
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
                        <td>
                          <input
                            form="expense-edit-form"
                            type="text"
                            required
                            className="field-input"
                            aria-label="Particular"
                            value={editForm.particular}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                particular: e.target.value,
                              })
                            }
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
                        <td>{row.paidAccountName}</td>
                        <td>{row.indirectExpenseName}</td>
                        <td className="cell-num">{formatRs(row.amount)}</td>
                        <td>{row.particular}</td>
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

              {initial.length === 0 && (
                <tr>
                  <td colSpan={6}>No expenses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form id="expense-add-form" onSubmit={onAdd} hidden />
      <form id="expense-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
