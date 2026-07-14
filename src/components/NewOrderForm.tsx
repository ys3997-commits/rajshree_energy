"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegularOrder } from "@/lib/actions/orders";

type Option = { id: string; name: string };

export function NewOrderForm({
  customers,
  staff,
  suggestedPo,
  onCancel,
}: {
  customers: Option[];
  staff: Option[];
  suggestedPo: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [poNumber, setPoNumber] = useState(suggestedPo);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const order = await createRegularOrder({
        poNumber: String(fd.get("poNumber") || ""),
        customerId: String(fd.get("customerId") || ""),
        orderDate: String(fd.get("orderDate") || "") || null,
        area: String(fd.get("area") || "") || null,
        creditDays: fd.get("creditDays")
          ? Number(fd.get("creditDays"))
          : null,
        quality: String(fd.get("quality") || "") || null,
        rate: String(fd.get("rate") || "") || null,
        quantity: String(fd.get("quantity") || ""),
        orderById: String(fd.get("orderById") || "") || null,
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="form-grid form-grid-plain">
        <label>PO number</label>
        <input
          name="poNumber"
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
        />
        <label>Customer</label>
        <select name="customerId" required defaultValue="">
          <option value="">Select…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label>Order date</label>
        <input
          name="orderDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
        <label>Quantity</label>
        <div className="field-with-unit">
          <input name="quantity" required type="number" step="any" min="0" />
          <span className="field-unit">MT</span>
        </div>
        <label>Rate</label>
        <div className="field-with-unit">
          <input name="rate" type="number" step="any" min="0" />
          <span className="field-unit">Rs</span>
        </div>
        <label>Credit days</label>
        <input name="creditDays" type="number" min="0" />
        <label>Quality</label>
        <input name="quality" />
        <label>Area</label>
        <input name="area" />
        <label>Order by</label>
        <select name="orderById" defaultValue="">
          <option value="">—</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
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
            {saving ? "Saving…" : "Create order"}
          </button>
        </div>
      </form>
    </div>
  );
}
