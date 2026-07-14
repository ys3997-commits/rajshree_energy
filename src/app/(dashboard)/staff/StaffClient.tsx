"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createStaff,
  deleteStaff,
  updateStaff,
} from "@/lib/actions/staff";

type StaffRow = {
  id: string;
  name: string;
  role: string | null;
};

export function StaffClient({ initial }: { initial: StaffRow[] }) {
  const [rows, setRows] = useState(initial);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refreshFromServer() {
    // After mutation, revalidatePath updates next load; keep local list in sync.
    startTransition(() => {
      window.location.reload();
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateStaff(editing.id, { name, role: role || null });
      } else {
        await createStaff({ name, role: role || null });
      }
      setName("");
      setRole("");
      setEditing(null);
      refreshFromServer();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this staff member?")) return;
    try {
      await deleteStaff(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">People</h1>
      {/* <p className="page-subtitle">
        People who deal and operate on the desk.
      </p> */}
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} />
        <label>Role</label>
        <input value={role} onChange={(e) => setRole(e.target.value)} />
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add staff"}
          </button>
          {editing && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setEditing(null);
                setName("");
                setRole("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.role ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(row);
                      setName(row.name);
                      setRole(row.role ?? "");
                    }}
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
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3}>No staff yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
