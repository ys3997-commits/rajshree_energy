"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createOpenPurchaseOrder,
  createRegularPurchaseOrder,
} from "@/lib/actions/purchaseOrders";

type Option = { id: string; name: string };

type VesselOpt = {
  id: string;
  vesselName: string;
  importerId: string;
  importer: { name: string } | null;
};

export function NewPurchaseOrderForm({
  importers,
  vessels,
  staff,
  suggestedPo,
  onCancel,
}: {
  importers: Option[];
  vessels: VesselOpt[];
  staff: Option[];
  suggestedPo: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"regular" | "open">("regular");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [poNumber, setPoNumber] = useState(suggestedPo);
  const [vesselId, setVesselId] = useState("");
  const [importerId, setImporterId] = useState("");

  const filteredVessels = useMemo(() => {
    if (!importerId) return vessels;
    return vessels.filter((v) => v.importerId === importerId);
  }, [vessels, importerId]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const base = {
        poNumber: String(fd.get("poNumber") || ""),
        importerId: String(fd.get("importerId") || ""),
        vesselId: String(fd.get("vesselId") || ""),
        orderDate: String(fd.get("orderDate") || "") || null,
        quality: String(fd.get("quality") || "") || null,
        rate: String(fd.get("rate") || "") || null,
        orderById: String(fd.get("orderById") || "") || null,
      };

      const order =
        mode === "regular"
          ? await createRegularPurchaseOrder({
              ...base,
              quantity: String(fd.get("quantity") || ""),
            })
          : await createOpenPurchaseOrder(base);

      router.push(`/purchase-orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="mb-4 flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === "regular"}
            onChange={() => setMode("regular")}
          />
          Regular
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === "open"}
            onChange={() => setMode("open")}
          />
          Open
        </label>
      </div>

      <form onSubmit={onSubmit} className="form-grid form-grid-plain">
        <label>Purchase PO number</label>
        <input
          name="poNumber"
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
        />

        <label>Importer</label>
        <select
          name="importerId"
          required
          value={importerId}
          onChange={(e) => {
            setImporterId(e.target.value);
            setVesselId("");
          }}
        >
          <option value="">Select…</option>
          {importers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Vessel</label>
        <select
          name="vesselId"
          required
          value={vesselId}
          onChange={(e) => {
            const id = e.target.value;
            setVesselId(id);
            const v = vessels.find((x) => x.id === id);
            if (v) setImporterId(v.importerId);
          }}
        >
          <option value="">Select…</option>
          {filteredVessels.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vesselName}
              {v.importer?.name ? ` — ${v.importer.name}` : ""}
            </option>
          ))}
        </select>

        <label>Order date</label>
        <input
          name="orderDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />

        {mode === "regular" && (
          <>
            <label>Quantity</label>
            <div className="field-with-unit">
              <input
                name="quantity"
                required
                type="number"
                step="any"
                min="0"
              />
              <span className="field-unit">MT</span>
            </div>
          </>
        )}

        <label>Rate (cost)</label>
        <div className="field-with-unit">
          <input name="rate" type="number" step="any" min="0" />
          <span className="field-unit">Rs</span>
        </div>

        <label>Quality</label>
        <input name="quality" />

        <label>Order by</label>
        <select name="orderById" defaultValue="">
          <option value="">—</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {mode === "open" && (
          <p
            className="text-sm text-neutral-600"
            style={{ gridColumn: "1 / -1" }}
          >
            Open purchase orders start with no quantity. Set quantity later
            after dispatches, same as open sale orders.
          </p>
        )}

        <div />
        <div className="modal-actions">
          {onCancel && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn" disabled={saving}>
            {saving ? "Saving…" : "Create purchase order"}
          </button>
        </div>
      </form>
    </div>
  );
}
