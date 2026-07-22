"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerCategory } from "@/generated/prisma";
import { getCustomerOrderDefaults } from "@/lib/actions/customers";
import { createRegularOrder } from "@/lib/actions/orders";
import { computeSaleRateBreakdown } from "@/lib/domain/saleRate";
import { RateBreakdownFields } from "@/components/RateBreakdownFields";
import {
  QualityClassSelect,
  type QualityClassOpt,
} from "@/components/QualityClassSelect";

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
  creditDays: number | null;
};

type Option = { id: string; name: string };

export function NewOrderForm({
  customers,
  ports,
  qualityClasses,
  suggestedPo,
  onCancel,
}: {
  customers: CustomerOpt[];
  ports: Option[];
  qualityClasses: QualityClassOpt[];
  suggestedPo: string;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [poNumber, setPoNumber] = useState(suggestedPo);
  const [customerId, setCustomerId] = useState("");
  const [customerCategory, setCustomerCategory] =
    useState<CustomerCategory | null>(null);
  const [creditDays, setCreditDays] = useState("");
  const [rate, setRate] = useState("");
  const [qualityClassId, setQualityClassId] = useState("");

  const rateBreakdown = useMemo(() => {
    if (rate === "") return null;
    return computeSaleRateBreakdown(rate, customerCategory);
  }, [rate, customerCategory]);

  async function onCustomerChange(id: string) {
    setCustomerId(id);
    if (!id) {
      setCustomerCategory(null);
      setCreditDays("");
      return;
    }

    const cached = customers.find((c) => c.id === id);
    if (cached) {
      setCustomerCategory(cached.category);
      setCreditDays(
        cached.creditDays != null ? String(cached.creditDays) : "",
      );
    }

    try {
      const fresh = await getCustomerOrderDefaults(id);
      setCustomerCategory(fresh.category);
      setCreditDays(
        fresh.creditDays != null ? String(fresh.creditDays) : "",
      );
    } catch {
      // Keep cached values if lookup fails.
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const order = await createRegularOrder({
        poNumber: String(fd.get("poNumber") || ""),
        customerId,
        orderDate: String(fd.get("orderDate") || "") || null,
        portId: String(fd.get("portId") || "") || null,
        creditDays: creditDays === "" ? null : Number(creditDays),
        qualityClassId: qualityClassId || null,
        rate: rate || null,
        quantity: String(fd.get("quantity") || ""),
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
        <label>Sale order number</label>
        <input
          name="poNumber"
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="SO 0001"
        />

        <label>Order date</label>
        <input
          name="orderDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />

        <label>Customer</label>
        <select
          name="customerId"
          required
          value={customerId}
          onChange={(e) => void onCustomerChange(e.target.value)}
        >
          <option value="">Select</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Quantity</label>
        <div className="field-with-unit">
          <input name="quantity" required type="number" step="any" min="0" />
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

        <label>Credit period</label>
        <div className="field-with-unit">
          <input
            name="creditDays"
            type="number"
            min="0"
            value={creditDays}
            onChange={(e) => setCreditDays(e.target.value)}
          />
          <span className="field-unit">days</span>
        </div>

        <label>Quality class</label>
        <QualityClassSelect
          value={qualityClassId}
          onChange={setQualityClassId}
          options={qualityClasses}
        />

        <label>Port</label>
        <select name="portId" defaultValue="">
          <option value="">Select</option>
          {ports.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
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
            {saving ? "Saving…" : "Create sale order"}
          </button>
        </div>
      </form>
    </div>
  );
}
