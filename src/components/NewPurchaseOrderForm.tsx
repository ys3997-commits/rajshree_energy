"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegularPurchaseOrder } from "@/lib/actions/purchaseOrders";
import { computePurchaseRateBreakdown } from "@/lib/domain/purchaseRate";
import { formatQualityClass, type QualityClassLabel } from "@/lib/domain/format";
import { RateBreakdownFields } from "@/components/RateBreakdownFields";

type Option = { id: string; name: string };

type VesselOpt = {
  id: string;
  vesselName: string;
  qualityClassId: string | null;
  qualityClass: QualityClassLabel | null;
  port: { id: string; name: string } | null;
};

export function NewPurchaseOrderForm({
  importers,
  vessels,
  suggestedPo,
  onCancel,
}: {
  importers: Option[];
  vessels: VesselOpt[];
  suggestedPo: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [poNumber, setPoNumber] = useState(suggestedPo);
  const [vesselId, setVesselId] = useState("");
  const [importerId, setImporterId] = useState("");
  const [rate, setRate] = useState("");

  const selectedVessel = useMemo(
    () => vessels.find((v) => v.id === vesselId) ?? null,
    [vessels, vesselId],
  );

  const rateBreakdown = useMemo(() => {
    if (rate === "") return null;
    return computePurchaseRateBreakdown(rate);
  }, [rate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const order = await createRegularPurchaseOrder({
        poNumber: String(fd.get("poNumber") || ""),
        importerId: String(fd.get("importerId") || ""),
        vesselId: String(fd.get("vesselId") || ""),
        orderDate: String(fd.get("orderDate") || "") || null,
        qualityClassId: selectedVessel?.qualityClassId || null,
        rate: rate || null,
        quantity: String(fd.get("quantity") || ""),
      });

      router.push(`/purchase-orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="form-grid form-grid-plain">
        <label>Purchase order number</label>
        <input
          name="poNumber"
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="PO 0001"
        />

        <label>Order date</label>
        <input
          name="orderDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />

        <label>Vendor</label>
        <select
          name="importerId"
          required
          value={importerId}
          onChange={(e) => setImporterId(e.target.value)}
        >
          <option value="">Select</option>
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
          onChange={(e) => setVesselId(e.target.value)}
        >
          <option value="">Select</option>
          {vessels.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vesselName}
              {v.qualityClass
                ? ` — ${formatQualityClass(v.qualityClass)}`
                : ""}
              {v.port ? ` — ${v.port.name}` : ""}
            </option>
          ))}
        </select>

        {selectedVessel && (
          <>
            <label>Quality</label>
            <div className="text-sm">
              {formatQualityClass(selectedVessel.qualityClass)}
            </div>
            <label>Port</label>
            <div className="text-sm">
              {selectedVessel.port?.name ?? "—"}
            </div>
          </>
        )}

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

        <label>Basic rate</label>
        <div className="field-with-unit field-with-prefix">
          <span className="field-unit">Rs</span>
          <input
            name="rate"
            type="number"
            step="0.01"
            min="0"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />
        </div>

        {rateBreakdown != null && (
          <RateBreakdownFields
            gst={rateBreakdown.gst}
            tcs={rateBreakdown.tcs}
            final={rateBreakdown.final}
          />
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
