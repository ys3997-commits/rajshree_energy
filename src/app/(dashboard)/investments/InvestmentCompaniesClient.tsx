"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createInvestmentCompany,
  deleteInvestmentCompany,
  updateInvestmentCompany,
  type InvestmentCompanyListRow,
} from "@/lib/actions/investments";
import { capitalizeName, formatRs } from "@/lib/domain/format";

type FormState = {
  name: string;
  openingDue: string;
  remark: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    openingDue: "0",
    remark: "",
  };
}

function formFromRow(row: InvestmentCompanyListRow): FormState {
  return {
    name: row.name,
    openingDue: row.openingDue,
    remark: row.remark ?? "",
  };
}

function formatNameField(value: string): string {
  return capitalizeName(value) ?? value;
}

function parseOpeningDueInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "0";
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error("Opening due must be a valid amount");
  }
  return trimmed;
}

export function InvestmentCompaniesClient({
  initial,
}: {
  initial: InvestmentCompanyListRow[];
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

  function payloadFrom(form: FormState) {
    return {
      ...form,
      openingDue: parseOpeningDueInput(form.openingDue),
    };
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createInvestmentCompany(payloadFrom(addForm));
        setAddForm(emptyForm());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: InvestmentCompanyListRow) {
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
        await updateInvestmentCompany(id, payloadFrom(editForm));
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this investment company?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteInvestmentCompany(id);
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
      <h1 className="page-title">Investment</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onAdd} className="mb-6 form-grid">
        <label>Investment company</label>
        <input
          required
          value={addForm.name}
          onChange={(e) => patchAdd({ name: e.target.value })}
          onBlur={() => {
            if (addForm.name.trim()) {
              patchAdd({ name: formatNameField(addForm.name) });
            }
          }}
        />
        <label>Opening due</label>
        <div className="field-with-unit">
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={addForm.openingDue}
            onChange={(e) => patchAdd({ openingDue: e.target.value })}
          />
          <span className="field-unit">Rs</span>
        </div>
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
            disabled={pending || editingId != null}
          >
            Add company
          </button>
        </div>
      </form>

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Investment company</th>
                <th className="num">Opening due</th>
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
                          <input
                            required
                            className="field-input"
                            aria-label="Investment company"
                            value={editForm.name}
                            onChange={(e) =>
                              patchEdit({ name: e.target.value })
                            }
                            onBlur={() => {
                              if (editForm.name.trim()) {
                                patchEdit({
                                  name: formatNameField(editForm.name),
                                });
                              }
                            }}
                          />
                        </td>
                        <td className="num">
                          <div className="field-with-unit">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0"
                              aria-label="Opening due"
                              value={editForm.openingDue}
                              onChange={(e) =>
                                patchEdit({ openingDue: e.target.value })
                              }
                            />
                            <span className="field-unit">Rs</span>
                          </div>
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
                        <td>{capitalizeName(row.name) ?? row.name}</td>
                        <td className="num">{formatRs(row.openingDue)}</td>
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
                  <td colSpan={4}>No investment companies yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
