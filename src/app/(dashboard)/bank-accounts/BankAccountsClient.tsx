"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createBankAccount,
  deleteBankAccount,
  updateBankAccount,
  type BankAccountListRow,
} from "@/lib/actions/bankAccounts";
import { capitalizeName, formatRs } from "@/lib/domain/format";

type FormState = {
  accountName: string;
  bankName: string;
  openingBalance: string;
};

const emptyForm: FormState = {
  accountName: "",
  bankName: "",
  openingBalance: "",
};

function parseOpeningBalanceInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "0";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error("Opening balance must be a valid amount");
  }
  return trimmed;
}

export function BankAccountsClient({
  initial,
}: {
  initial: BankAccountListRow[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<BankAccountListRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload() {
    startTransition(() => window.location.reload());
  }

  function startEdit(row: BankAccountListRow) {
    setEditing(row);
    setForm({
      accountName: row.accountName,
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
      <h1 className="page-title">Bank</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label htmlFor="bank-account-name">Account name</label>
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

        <label htmlFor="opening-balance">Opening balance</label>
        <div className="field-with-unit">
          <input
            id="opening-balance"
            type="number"
            step="0.01"
            placeholder="0"
            value={form.openingBalance}
            onChange={(e) =>
              setForm({ ...form, openingBalance: e.target.value })
            }
          />
          <span className="field-unit">Rs</span>
        </div>

        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add bank account"}
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
                <th>Account name</th>
                <th>Bank</th>
                <th className="num">Opening balance</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No bank accounts yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.accountName}</td>
                    <td>{row.bankName}</td>
                    <td className="num">{formatRs(row.openingBalance)}</td>
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
                        className="btn btn-secondary"
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
