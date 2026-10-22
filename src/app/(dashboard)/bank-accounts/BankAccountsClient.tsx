"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import {
  createBankAccount,
  deleteBankAccount,
  updateBankAccount,
  type BankAccountListRow,
} from "@/lib/actions/bankAccounts";
import type { BankAccountTypeRow } from "@/lib/actions/bankAccountTypes";
import {
  capitalizeName,
  formatIndianAmountTyping,
  formatIndianNumber,
  parseAmountInput,
} from "@/lib/domain/format";

type FormState = {
  accountName: string;
  accountTypeId: string;
  bankName: string;
  openingBalance: string;
};

const emptyForm: FormState = {
  accountName: "",
  accountTypeId: "",
  bankName: "",
  openingBalance: "",
};

function normalizeOpeningBalanceTyping(value: string): string {
  const trimmed = parseAmountInput(value);
  if (!trimmed || trimmed === "-") return trimmed;
  const negative = trimmed.startsWith("-");
  const digits = (negative ? trimmed.slice(1) : trimmed).replace(/[^\d.]/g, "");
  if (!digits) return negative ? "-" : "";
  const formatted = formatIndianAmountTyping(digits);
  return negative ? `-${formatted}` : formatted;
}

function parseOpeningBalanceInput(value: string): string {
  const trimmed = parseAmountInput(value);
  if (!trimmed || trimmed === "-") return "0.00";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error("Opening balance must be a valid amount");
  }
  return n.toFixed(2);
}

function formatOpeningBalanceTyping(value: string): string {
  if (!value || value === "-") return value;
  if (value.startsWith("-")) {
    return `-${formatIndianAmountTyping(value.slice(1))}`;
  }
  return formatIndianAmountTyping(value);
}

function formatOpeningBalanceDisplay(value: string): string {
  return `Rs ${formatIndianNumber(value, 2)}`;
}

export function BankAccountsClient({
  initial,
  accountTypes,
}: {
  initial: BankAccountListRow[];
  accountTypes: BankAccountTypeRow[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<BankAccountListRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const openingBalanceDisplay = useMemo(
    () => formatOpeningBalanceTyping(form.openingBalance),
    [form.openingBalance],
  );

  function reload() {
    startTransition(() => window.location.reload());
  }

  function startEdit(row: BankAccountListRow) {
    setEditing(row);
    setForm({
      accountName: row.accountName,
      accountTypeId: row.accountTypeId ?? "",
      bankName: row.bankName,
      openingBalance: row.openingBalance,
    });
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        accountName: form.accountName,
        accountTypeId: form.accountTypeId,
        bankName: form.bankName,
        openingBalance: parseOpeningBalanceInput(form.openingBalance),
      };
      if (editing) await updateBankAccount(editing.id, payload);
      else await createBankAccount(payload);
      setForm(emptyForm);
      setEditing(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this bank account?")) return;
    try {
      await deleteBankAccount(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      if (editing?.id === id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Create Bank Account</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label htmlFor="bank-account-name">Account Name</label>
        <input
          id="bank-account-name"
          required
          value={form.accountName}
          onChange={(e) => setForm({ ...form, accountName: e.target.value })}
          onBlur={() => {
            if (form.accountName.trim()) {
              setForm({
                ...form,
                accountName:
                  capitalizeName(form.accountName) ?? form.accountName,
              });
            }
          }}
        />

        <label htmlFor="type-of-account">Type of Account</label>
        <select
          id="type-of-account"
          required
          value={form.accountTypeId}
          onChange={(e) =>
            setForm({ ...form, accountTypeId: e.target.value })
          }
        >
          <option value="">Select</option>
          {accountTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>

        <label htmlFor="bank-name">Bank</label>
        <input
          id="bank-name"
          required
          value={form.bankName}
          onChange={(e) => setForm({ ...form, bankName: e.target.value })}
          onBlur={() => {
            if (form.bankName.trim()) {
              setForm({
                ...form,
                bankName: capitalizeName(form.bankName) ?? form.bankName,
              });
            }
          }}
        />

        <label htmlFor="opening-balance">Opening Balance</label>
        <div className="field-with-unit">
          <input
            id="opening-balance"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={openingBalanceDisplay}
            onChange={(e) =>
              setForm({
                ...form,
                openingBalance: parseAmountInput(
                  normalizeOpeningBalanceTyping(e.target.value),
                ),
              })
            }
          />
          <span className="field-unit">Rs</span>
        </div>

        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add Bank Account"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Type of Account</th>
                <th>Bank</th>
                <th className="num">Opening Balance</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5}>No bank accounts yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.accountName}</td>
                    <td>{row.accountTypeName ?? "—"}</td>
                    <td>{row.bankName}</td>
                    <td className="num">
                      {formatOpeningBalanceDisplay(row.openingBalance)}
                    </td>
                    <td className="space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => startEdit(row)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => onDelete(row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
