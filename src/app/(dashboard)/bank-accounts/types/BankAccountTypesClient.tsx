"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createBankAccountType,
  deleteBankAccountType,
  updateBankAccountType,
  type BankAccountTypeRow,
} from "@/lib/actions/bankAccountTypes";
import { capitalizeName } from "@/lib/domain/format";

export function BankAccountTypesClient({
  initial,
}: {
  initial: BankAccountTypeRow[];
}) {
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<BankAccountTypeRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload() {
    startTransition(() => window.location.reload());
  }

  function startEdit(row: BankAccountTypeRow) {
    setEditing(row);
    setName(row.name);
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setName("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) await updateBankAccountType(editing.id, name);
      else await createBankAccountType(name);
      setName("");
      setEditing(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this type of bank account?")) return;
    try {
      await deleteBankAccountType(id);
      setRows((prev) => prev.filter((row) => row.id !== id));
      if (editing?.id === id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Type of Bank Account</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label htmlFor="bank-account-type-name">Type of Account</label>
        <input
          id="bank-account-type-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim()) {
              setName(capitalizeName(name) ?? name);
            }
          }}
          placeholder="e.g. Current Account"
        />

        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add Type"}
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
                <th>Type of Account</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2}>No types yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
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
