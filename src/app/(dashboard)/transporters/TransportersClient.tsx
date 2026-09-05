"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import {
  createTransporter,
  deleteTransporter,
  updateTransporter,
  type TransporterListRow,
} from "@/lib/actions/transporters";
import { capitalizeName, formatRs } from "@/lib/domain/format";
import { OptionSelect } from "@/components/OptionSelect";

type FormState = {
  name: string;
  ownerName: string;
  ownerContactNumber1: string;
  ownerContactNumber2: string;
  email: string;
  city: string;
  state: string;
  openingDue: string;
};

function emptyForm(): FormState {
  return {
    name: "",
    ownerName: "",
    ownerContactNumber1: "",
    ownerContactNumber2: "",
    email: "",
    city: "",
    state: "",
    openingDue: "0",
  };
}

function formFromRow(row: TransporterListRow): FormState {
  return {
    name: row.name,
    ownerName: row.ownerName ?? "",
    ownerContactNumber1: row.ownerContactNumber1 ?? "",
    ownerContactNumber2: row.ownerContactNumber2 ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    openingDue: row.openingDue,
  };
}

function formatNameField(value: string): string {
  return capitalizeName(value) ?? value;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
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

export function TransportersClient({
  initial,
  cities,
  states,
}: {
  initial: TransporterListRow[];
  cities: string[];
  states: string[];
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
        await createTransporter(payloadFrom(addForm));
        setAddForm(emptyForm());
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function startEdit(row: TransporterListRow) {
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

  function saveEdit() {
    if (!editingId) return;
    setError(null);
    const id = editingId;
    startTransition(async () => {
      try {
        await updateTransporter(id, payloadFrom(editForm));
        cancelEdit();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function onDelete(id: string) {
    if (!confirm("Delete this transporter?")) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteTransporter(id);
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

  function setAddNameField(key: keyof FormState, value: string) {
    patchAdd({ [key]: value });
  }

  function blurAddNameField(key: keyof FormState) {
    const value = addForm[key];
    if (typeof value === "string" && value.trim()) {
      patchAdd({ [key]: formatNameField(value) });
    }
  }

  function setAddPhoneField(key: keyof FormState, value: string) {
    patchAdd({ [key]: digitsOnly(value) });
  }

  function setEditNameField(key: keyof FormState, value: string) {
    patchEdit({ [key]: value });
  }

  function blurEditNameField(key: keyof FormState) {
    const value = editForm[key];
    if (typeof value === "string" && value.trim()) {
      patchEdit({ [key]: formatNameField(value) });
    }
  }

  function setEditPhoneField(key: keyof FormState, value: string) {
    patchEdit({ [key]: digitsOnly(value) });
  }

  return (
    <div>
      <h1 className="page-title">Transporters</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onAdd} className="mb-6 form-grid">
        <label>Company name</label>
        <input
          required
          value={addForm.name}
          onChange={(e) => setAddNameField("name", e.target.value)}
          onBlur={() => blurAddNameField("name")}
        />
        <label>Transport Owner</label>
        <input
          value={addForm.ownerName}
          onChange={(e) => setAddNameField("ownerName", e.target.value)}
          onBlur={() => blurAddNameField("ownerName")}
        />
        <label>Owner contact 1</label>
        <input
          inputMode="numeric"
          value={addForm.ownerContactNumber1}
          onChange={(e) =>
            setAddPhoneField("ownerContactNumber1", e.target.value)
          }
        />
        <label>Owner contact 2</label>
        <input
          inputMode="numeric"
          value={addForm.ownerContactNumber2}
          onChange={(e) =>
            setAddPhoneField("ownerContactNumber2", e.target.value)
          }
        />
        <label>Email</label>
        <input
          type="email"
          value={addForm.email}
          onChange={(e) => patchAdd({ email: e.target.value })}
        />
        <label>City</label>
        <OptionSelect
          value={addForm.city}
          onChange={(city) => patchAdd({ city })}
          options={cities}
        />
        <label>State</label>
        <OptionSelect
          value={addForm.state}
          onChange={(state) => patchAdd({ state })}
          options={states}
        />
        <label>
          Opening due
          <span className="field-hint"> as on 01/08/2026</span>
        </label>
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
        <div />
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn"
            disabled={pending || editingId != null}
          >
            Add transporter
          </button>
        </div>
      </form>

      <div className="table-wrap">
        <div className="table-h-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Company</th>
                <th>Transport Owner</th>
                <th>Contact 1</th>
                <th>Contact 2</th>
                <th>Email</th>
                <th>City</th>
                <th>State</th>
                <th className="num">Opening due</th>
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
                            aria-label="Company name"
                            value={editForm.name}
                            onChange={(e) =>
                              setEditNameField("name", e.target.value)
                            }
                            onBlur={() => blurEditNameField("name")}
                          />
                        </td>
                        <td>
                          <input
                            className="field-input"
                            aria-label="Transport Owner"
                            value={editForm.ownerName}
                            onChange={(e) =>
                              setEditNameField("ownerName", e.target.value)
                            }
                            onBlur={() => blurEditNameField("ownerName")}
                          />
                        </td>
                        <td>
                          <input
                            className="field-input"
                            inputMode="numeric"
                            aria-label="Owner contact 1"
                            value={editForm.ownerContactNumber1}
                            onChange={(e) =>
                              setEditPhoneField(
                                "ownerContactNumber1",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="field-input"
                            inputMode="numeric"
                            aria-label="Owner contact 2"
                            value={editForm.ownerContactNumber2}
                            onChange={(e) =>
                              setEditPhoneField(
                                "ownerContactNumber2",
                                e.target.value,
                              )
                            }
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            className="field-input"
                            aria-label="Email"
                            value={editForm.email}
                            onChange={(e) =>
                              patchEdit({ email: e.target.value })
                            }
                          />
                        </td>
                        <td>
                          <OptionSelect
                            value={editForm.city}
                            onChange={(city) => patchEdit({ city })}
                            options={cities}
                            emptyLabel="City"
                          />
                        </td>
                        <td>
                          <OptionSelect
                            value={editForm.state}
                            onChange={(state) => patchEdit({ state })}
                            options={states}
                            emptyLabel="State"
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
                          <Link
                            href={`/transporters/${row.id}`}
                            className="font-medium"
                          >
                            {capitalizeName(row.name) ?? row.name}
                          </Link>
                        </td>
                        <td>
                          {row.ownerName
                            ? (capitalizeName(row.ownerName) ?? row.ownerName)
                            : "—"}
                        </td>
                        <td>{row.ownerContactNumber1 ?? "—"}</td>
                        <td>{row.ownerContactNumber2 ?? "—"}</td>
                        <td>{row.email ?? "—"}</td>
                        <td>{row.city ?? "—"}</td>
                        <td>{row.state ?? "—"}</td>
                        <td className="num">{formatRs(row.openingDue)}</td>
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
                  <td colSpan={9}>No transporters yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
