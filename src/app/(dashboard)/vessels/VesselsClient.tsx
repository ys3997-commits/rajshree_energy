"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createVessel,
  deleteVessel,
  updateVessel,
} from "@/lib/actions/vessels";
import {
  QualityClassSelect,
  type QualityClassOpt,
} from "@/components/QualityClassSelect";
import { formatQualityClass, capitalizeName } from "@/lib/domain/format";
import { VesselStatusToggle } from "@/components/VesselStatusToggle";

type Opt = { id: string; name: string };
type PortOpt = Opt & { state: string };
type Row = {
  id: string;
  vesselName: string;
  qualityClassId: string | null;
  qualityClass: QualityClassOpt | null;
  portId: string | null;
  port: PortOpt | null;
  active: boolean;
};

const empty = {
  vesselName: "",
  qualityClassId: "",
  portId: "",
};

export function VesselsClient({
  initial,
  qualityClasses,
  ports,
}: {
  initial: Row[];
  qualityClasses: QualityClassOpt[];
  ports: PortOpt[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload() {
    startTransition(() => window.location.reload());
  }

  function startEdit(row: Row) {
    setEditing(row);
    setForm({
      vesselName: row.vesselName,
      qualityClassId: row.qualityClassId ?? "",
      portId: row.portId ?? "",
    });
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setForm(empty);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing) {
        await updateVessel(editing.id, {
          vesselName: form.vesselName,
          qualityClassId: form.qualityClassId,
          portId: form.portId,
          active: editing.active,
        });
      } else {
        await createVessel({
          vesselName: form.vesselName,
          qualityClassId: form.qualityClassId,
          portId: form.portId,
        });
      }
      setForm(empty);
      setEditing(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this vessel?")) return;
    try {
      await deleteVessel(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      if (editing?.id === id) cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div>
      <h1 className="page-title">Vessels</h1>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Vessel name</label>
        <input
          required
          value={form.vesselName}
          onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
          onBlur={() => {
            if (form.vesselName.trim()) {
              setForm({
                ...form,
                vesselName: capitalizeName(form.vesselName) ?? form.vesselName,
              });
            }
          }}
        />
        <label>Quality class</label>
        <QualityClassSelect
          required
          emptyLabel="Select"
          value={form.qualityClassId}
          onChange={(qualityClassId) => setForm({ ...form, qualityClassId })}
          options={qualityClasses}
        />
        <label>Port</label>
        <select
          required
          value={form.portId}
          onChange={(e) => setForm({ ...form, portId: e.target.value })}
        >
          <option value="">Select</option>
          {ports.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}, {p.state}
            </option>
          ))}
        </select>
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            {editing ? "Update" : "Add vessel"}
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
        <div className="table-h-scroll"><table className="data">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>Quality</th>
              <th>Port</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={row.active ? undefined : "vessel-row-inactive"}
              >
                <td>{row.vesselName}</td>
                <td>{formatQualityClass(row.qualityClass)}</td>
                <td>
                  {row.port ? `${row.port.name}, ${row.port.state}` : "—"}
                </td>
                <td>
                  <VesselStatusToggle
                    vesselId={row.id}
                    active={row.active}
                    onChange={(active) => {
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, active } : r,
                        ),
                      );
                    }}
                    onError={setError}
                  />
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
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>No vessels yet.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>
    </div>
  );
}
