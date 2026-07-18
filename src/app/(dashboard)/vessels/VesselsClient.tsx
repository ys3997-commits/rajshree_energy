"use client";

import { FormEvent, useState, useTransition } from "react";
import {
  createVessel,
  deleteVessel,
  updateVessel,
} from "@/lib/actions/vessels";
import {
  createPortOption,
  deletePortOption,
  updatePortOption,
} from "@/lib/actions/ports";
import {
  QualityClassSelect,
  type QualityClassOpt,
} from "@/components/QualityClassSelect";
import { formatQualityClass } from "@/lib/domain/format";

type Opt = { id: string; name: string };
type Row = {
  id: string;
  vesselName: string;
  qualityClassId: string | null;
  qualityClass: QualityClassOpt | null;
  portId: string | null;
  port: Opt | null;
};

const empty = {
  vesselName: "",
  qualityClassId: "",
  portId: "",
};

export function VesselsClient({
  initial,
  qualityClasses,
  ports: initialPorts,
}: {
  initial: Row[];
  qualityClasses: QualityClassOpt[];
  ports: Opt[];
}) {
  const [rows, setRows] = useState(initial);
  const [ports, setPorts] = useState(initialPorts);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Row | null>(null);
  const [portName, setPortName] = useState("");
  const [editingPort, setEditingPort] = useState<Opt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload() {
    startTransition(() => window.location.reload());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        vesselName: form.vesselName,
        qualityClassId: form.qualityClassId || null,
        portId: form.portId || null,
      };
      if (editing) await updateVessel(editing.id, payload);
      else await createVessel(payload);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function onSavePort(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingPort) {
        await updatePortOption(editingPort.id, portName);
        setEditingPort(null);
      } else {
        await createPortOption(portName);
      }
      setPortName("");
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save port");
    }
  }

  async function onDeletePort(id: string) {
    if (!confirm("Delete this port option?")) return;
    setError(null);
    try {
      await deletePortOption(id);
      setPorts((prev) => prev.filter((p) => p.id !== id));
      if (editingPort?.id === id) {
        setEditingPort(null);
        setPortName("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete port");
    }
  }

  return (
    <div>
      <h1 className="page-title">Vessels</h1>
      <p className="page-subtitle">
        Vessel registry with quality class and port.
      </p>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="mb-6 form-grid">
        <label>Vessel name</label>
        <input
          required
          value={form.vesselName}
          onChange={(e) => setForm({ ...form, vesselName: e.target.value })}
        />
        <label>Quality class</label>
        <QualityClassSelect
          value={form.qualityClassId}
          onChange={(qualityClassId) => setForm({ ...form, qualityClassId })}
          options={qualityClasses}
        />
        <label>Port</label>
        <select
          value={form.portId}
          onChange={(e) => setForm({ ...form, portId: e.target.value })}
        >
          <option value="">—</option>
          {ports.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
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
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap mb-10">
        <table className="data">
          <thead>
            <tr>
              <th>Vessel</th>
              <th>Quality</th>
              <th>Port</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.vesselName}</td>
                <td>{formatQualityClass(row.qualityClass)}</td>
                <td>{row.port?.name ?? "—"}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditing(row);
                      setForm({
                        vesselName: row.vesselName,
                        qualityClassId: row.qualityClassId ?? "",
                        portId: row.portId ?? "",
                      });
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
                <td colSpan={4}>No vessels yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 text-base font-semibold">Port options</h2>
      <div className="table-wrap mb-3" style={{ maxWidth: 560 }}>
        <table className="data">
          <thead>
            <tr>
              <th>Name</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {ports.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="space-x-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditingPort(p);
                      setPortName(p.name);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => onDeletePort(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {ports.length === 0 && (
              <tr>
                <td colSpan={2}>No ports yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <form
        onSubmit={onSavePort}
        className="flex gap-2"
        style={{ maxWidth: 560 }}
      >
        <input
          required
          placeholder={editingPort ? "Edit port" : "New port"}
          value={portName}
          onChange={(e) => setPortName(e.target.value)}
        />
        <button type="submit" className="btn" disabled={pending}>
          {editingPort ? "Update" : "Add"}
        </button>
        {editingPort && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setEditingPort(null);
              setPortName("");
            }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}
