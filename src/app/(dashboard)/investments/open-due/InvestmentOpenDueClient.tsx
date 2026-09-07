"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createInvestmentOpenDue,
  deleteInvestmentOpenDue,
  updateInvestmentOpenDue,
  type InvestmentOpenDueListRow,
} from "@/lib/actions/investmentOpenDues";
import { capitalizeName, formatRs } from "@/lib/domain/format";

type CompanyOpt = { id: string; name: string };

type FormState = {
  companyId: string;
  amount: string;
  dueDate: string;
  remark: string;
};

function emptyForm(): FormState {
  return {
    companyId: "",
    amount: "",
    dueDate: "",
    remark: "",
  };
}

function formFromRow(row: InvestmentOpenDueListRow): FormState {
  return {
    companyId: row.companyId,
    amount: row.amount,
    dueDate: row.dueDate ?? "",
    remark: row.remark ?? "",
  };
}

function formatDisplayDate(value: string | null): string {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

export function InvestmentOpenDueClient({
  initial,
  companies,
}: {
  initial: InvestmentOpenDueListRow[];
  companies: CompanyOpt[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setRows(initial);
  }

  const [addForm, setAddForm] = useState<FormState>(() => emptyForm());
  const [editForm, setEditForm] = useState<FormState>(() => emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createInvestmentOpenDue(addForm);
        setAddForm(emptyForm());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: InvestmentOpenDueListRow) {
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
    setError(null);
    const id = editingId;
    startTransition(async () => {
      try {
        await updateInvestmentOpenDue(id, editForm);
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this open due entry?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteInvestmentOpenDue(id);
        if (editingId === id) cancelEdit();
        setRows((prev) => prev.filter((r) => r.id !== id));
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    });
  }

  function patchAdd(patch: Partial<FormState>) {
    setAddForm((prev) => ({ ...prev, ...patch }));
  }

  function patchEdit(patch: Partial<FormState>) {
    setEditForm((prev) => ({ ...prev, ...patch }));
  }

  return (
    <div>
      <Link href="/investments" className="back-link">
        ← Investment
      </Link>
      <h1 className="page-title">Open Due</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onAdd} className="mb-6 form-grid">
        <label>Company</label>
        <select
          required
          value={addForm.companyId}
          onChange={(e) => patchAdd({ companyId: e.target.value })}
        >
          <option value="">Select company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {capitalizeName(company.name) ?? company.name}
            </option>
          ))}
        </select>
        <label>Amount</label>
        <div className="field-with-unit">
          <input
            required
            type="number"
            step="0.01"
            placeholder="0"
            value={addForm.amount}
            onChange={(e) => patchAdd({ amount: e.target.value })}
          />
          <span className="field-unit">Rs</span>
        </div>
        <label>Due date</label>
        <input
          type="date"
          value={addForm.dueDate}
          onChange={(e) => patchAdd({ dueDate: e.target.value })}
        />
        <label>Remark</label>
        <input
          value={addForm.remark}
          onChange={(e) => patchAdd({ remark: e.target.value })}
        />
        <div />
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn"
            disabled={pending || editingId != null || companies.length === 0}
          >
            Add open due
          </button>
        </div>
      </form>

      {companies.length === 0 && (
        <p className="page-subtitle">
          Add an investment company first before recording open dues.
        </p>
      )}

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Company</th>
                <th className="num">Amount</th>
                <th>Due date</th>
                <th>Remark</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isEditing = editingId === row.id;
                return (
                  <tr
                    key={row.id}
                    className={isEditing ? "payment-editing-row" : undefined}
                  >
                    {isEditing ? (
                      <>
                        <td>
                          <select
                            required
                            className="field-input"
                            aria-label="Company"
                            value={editForm.companyId}
                            onChange={(e) =>
                              patchEdit({ companyId: e.target.value })
                            }
                          >
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {capitalizeName(company.name) ?? company.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="num">
                          <div className="field-with-unit">
                            <input
                              required
                              type="number"
                              step="0.01"
                              className="field-input"
                              aria-label="Amount"
                              value={editForm.amount}
                              onChange={(e) =>
                                patchEdit({ amount: e.target.value })
                              }
                            />
                            <span className="field-unit">Rs</span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="field-input"
                            aria-label="Due date"
                            value={editForm.dueDate}
                            onChange={(e) =>
                              patchEdit({ dueDate: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="field-input"
                            aria-label="Remark"
                            value={editForm.remark}
                            onChange={(e) =>
                              patchEdit({ remark: e.target.value })
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
                        <td>
                          {capitalizeName(row.companyName) ?? row.companyName}
                        </td>
                        <td className="num">{formatRs(row.amount)}</td>
                        <td>{formatDisplayDate(row.dueDate)}</td>
                        <td>{row.remark ?? "—"}</td>
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
                            onClick={() => onDelete(row.id)}
                            disabled={pending}
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
                  <td colSpan={5}>No open dues yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
