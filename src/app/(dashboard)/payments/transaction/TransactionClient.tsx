"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import type { BankAccountBalanceRow } from "@/lib/actions/bankAccounts";
import {
  createBankTransfer,
  deleteBankTransfer,
  updateBankTransfer,
  type BankTransferRow,
} from "@/lib/actions/bankTransfers";
import {
  formatIndianAmountTyping,
  formatRs,
  parseAmountInput,
} from "@/lib/domain/format";

type AccountOption = BankAccountBalanceRow;

type FormState = {
  date: string;
  paidAccountId: string;
  receivedAccountId: string;
  amount: string;
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
    receivedAccountId: "",
    amount: "",
  };
}

function formFromRow(row: BankTransferRow): FormState {
  return {
    date: row.date,
    paidAccountId: row.paidAccountId,
    receivedAccountId: row.receivedAccountId,
    amount: row.amount,
  };
}

function formatDateDdMmYyyy(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim().slice(0, 10));
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function accountNameOf(accounts: AccountOption[], id: string): string {
  return accounts.find((account) => account.id === id)?.accountName ?? "";
}

function sameAccountName(left: string, right: string): boolean {
  const a = left.trim().toLowerCase();
  const b = right.trim().toLowerCase();
  return a.length > 0 && a === b;
}

function optionsExceptName(accounts: AccountOption[], blockedName: string) {
  if (!blockedName.trim()) return accounts;
  return accounts.filter(
    (account) => !sameAccountName(account.accountName, blockedName),
  );
}

export function TransactionClient({
  accounts,
  initial,
}: {
  accounts: AccountOption[];
  initial: BankTransferRow[];
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

  function setPaid(form: FormState, paidAccountId: string): FormState {
    const paidName = accountNameOf(accounts, paidAccountId);
    const receivedName = accountNameOf(accounts, form.receivedAccountId);
    return {
      ...form,
      paidAccountId,
      receivedAccountId: sameAccountName(paidName, receivedName)
        ? ""
        : form.receivedAccountId,
    };
  }

  function setReceived(form: FormState, receivedAccountId: string): FormState {
    const receivedName = accountNameOf(accounts, receivedAccountId);
    const paidName = accountNameOf(accounts, form.paidAccountId);
    return {
      ...form,
      receivedAccountId,
      paidAccountId: sameAccountName(paidName, receivedName)
        ? ""
        : form.paidAccountId,
    };
  }

  function validate(form: FormState): string | null {
    if (!form.date) return "Date is required";
    if (!form.paidAccountId) return "Select a fund paid account";
    if (!form.receivedAccountId) return "Select a fund received account";
    if (
      sameAccountName(
        accountNameOf(accounts, form.paidAccountId),
        accountNameOf(accounts, form.receivedAccountId),
      )
    ) {
      return "Fund paid and fund received cannot be the same account";
    }
    if (!form.amount || Number(form.amount) <= 0) {
      return "Amount must be greater than zero";
    }
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
        await createBankTransfer(addForm);
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

  function startEdit(row: BankTransferRow) {
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
        await updateBankTransfer(editingId, editForm);
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

  function onDelete(row: BankTransferRow) {
    if (!confirm(`Delete transaction of ${formatRs(row.amount)}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteBankTransfer(row.id);
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

  const addPaidOptions = optionsExceptName(
    accounts,
    accountNameOf(accounts, addForm.receivedAccountId),
  );
  const addReceivedOptions = optionsExceptName(
    accounts,
    accountNameOf(accounts, addForm.paidAccountId),
  );

  const activeForm = editingId ? editForm : addForm;

  function pickAccount(accountId: string) {
    const apply = (form: FormState): FormState => {
      if (form.paidAccountId === accountId || form.receivedAccountId === accountId) {
        return form;
      }
      const clickedName = accountNameOf(accounts, accountId);
      const paidName = accountNameOf(accounts, form.paidAccountId);
      if (!form.paidAccountId) return setPaid(form, accountId);
      if (!form.receivedAccountId && !sameAccountName(clickedName, paidName)) {
        return setReceived(form, accountId);
      }
      return setPaid(form, accountId);
    };
    if (editingId) setEditForm((form) => apply(form));
    else setAddForm((form) => apply(form));
  }

  return (
    <div>
      <h1 className="page-title">Transaction Our Bank</h1>
      {error && <div className="error-box">{error}</div>}

      <section className="extra-information" aria-label="Extra information">
        <h2 className="extra-information-title">Extra information</h2>
        {accounts.length === 0 ? (
          <p>No bank accounts yet. Add one under Bank.</p>
        ) : (
          <div className="detail-stat-row">
            {accounts.map((account) => {
              const selected =
                activeForm.paidAccountId === account.id ||
                activeForm.receivedAccountId === account.id;
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
                <th>Fund received</th>
                <th className="cell-num">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr className="payment-entry-row">
                <td>
                  <input
                    form="transfer-add-form"
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
                    "transfer-add-form",
                    "Fund paid",
                    addForm.paidAccountId,
                    addPaidOptions,
                    (paidAccountId) => setAddForm(setPaid(addForm, paidAccountId)),
                  )}
                </td>
                <td className="payment-account-cell">
                  {accountSelect(
                    "transfer-add-form",
                    "Fund received",
                    addForm.receivedAccountId,
                    addReceivedOptions,
                    (receivedAccountId) =>
                      setAddForm(setReceived(addForm, receivedAccountId)),
                  )}
                </td>
                <td className="cell-num payment-amount-cell">
                  <input
                    form="transfer-add-form"
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
                    form="transfer-add-form"
                    type="submit"
                    className="btn btn-sm"
                    disabled={pending || editingId != null || accounts.length < 2}
                  >
                    Add
                  </button>
                </td>
              </tr>

              {initial.map((row) => {
                const isEditing = editingId === row.id;
                const editPaidOptions = optionsExceptName(
                  accounts,
                  accountNameOf(accounts, editForm.receivedAccountId),
                );
                const editReceivedOptions = optionsExceptName(
                  accounts,
                  accountNameOf(accounts, editForm.paidAccountId),
                );
                return (
                  <tr
                    key={row.id}
                    className={isEditing ? "payment-editing-row" : undefined}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <input
                            form="transfer-edit-form"
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
                            "transfer-edit-form",
                            "Fund paid",
                            editForm.paidAccountId,
                            editPaidOptions,
                            (paidAccountId) =>
                              setEditForm(setPaid(editForm, paidAccountId)),
                          )}
                        </td>
                        <td className="payment-account-cell">
                          {accountSelect(
                            "transfer-edit-form",
                            "Fund received",
                            editForm.receivedAccountId,
                            editReceivedOptions,
                            (receivedAccountId) =>
                              setEditForm(setReceived(editForm, receivedAccountId)),
                          )}
                        </td>
                        <td className="cell-num payment-amount-cell">
                          <input
                            form="transfer-edit-form"
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
                        <td>{row.paidAccountName}</td>
                        <td>{row.receivedAccountName}</td>
                        <td className="cell-num">{formatRs(row.amount)}</td>
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
                  <td colSpan={5}>No transactions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form id="transfer-add-form" onSubmit={onAdd} hidden />
      <form id="transfer-edit-form" onSubmit={onUpdate} hidden />
    </div>
  );
}
