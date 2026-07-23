"use client";

import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";
import {
  createVessel,
  deleteVessel,
} from "@/lib/actions/vessels";
import {
  QualityClassSelect,
  type QualityClassOpt,
} from "@/components/QualityClassSelect";
import { formatQualityClass, capitalizeName } from "@/lib/domain/format";
import { VesselStatusToggle } from "@/components/VesselStatusToggle";

type Opt = { id: string; name: string };
type Row = {
  id: string;
  vesselName: string;
  qualityClassId: string | null;
  qualityClass: QualityClassOpt | null;
  portId: string | null;
  port: Opt | null;
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
  ports: Opt[];
}) {
  const [rows, setRows] = useState(initial);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reload() {
    startTransition(() => window.location.reload());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createVessel({
        vesselName: form.vesselName,
        qualityClassId: form.qualityClassId,
        portId: form.portId,
      });
      setForm(empty);
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

  return (
    <div>
      <h1 className="page-title">Vessels</h1>
      <p className="page-subtitle">
        Vessel registry with quality class and port. Manage port options on the{" "}
        <Link href="/options">Options</Link> page.
      </p>
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
              {p.name}
            </option>
          ))}
        </select>
        <div />
        <div className="flex gap-2">
          <button type="submit" className="btn" disabled={pending}>
            Add vessel
          </button>
        </div>
      </form>

      <div className="table-wrap">
        <table className="data">
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
              <tr key={row.id} className={row.active ? undefined : "vessel-row-inactive"}>
                <td>{row.vesselName}</td>
                <td>{formatQualityClass(row.qualityClass)}</td>
                <td>{row.port?.name ?? "—"}</td>
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
        </table>
      </div>
    </div>
  );
}
