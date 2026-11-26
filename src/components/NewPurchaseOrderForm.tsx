"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createRegularPurchaseOrder } from "@/lib/actions/purchaseOrders";
import { throwIfActionError } from "@/lib/auth/errors";
import {
  computeDoRateMinusHandling,
  computePurchaseRateBreakdown,
  DO_CALCULATION_OPTIONS,
  isBlockAmountRequired,
  resolveDoRate,
  type DoCalculationAsPer,
} from "@/lib/domain/purchaseRate";
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
  const [doCalculationAsPer, setDoCalculationAsPer] =
    useState<DoCalculationAsPer | "">("");
  const [handlingCharge, setHandlingCharge] = useState("");
  const [blockAmount, setBlockAmount] = useState("");

  const selectedVessel = useMemo(
    () => vessels.find((v) => v.id === vesselId) ?? null,
    [vessels, vesselId],
  );

  const rateBreakdown = useMemo(() => {
    if (rate === "") return null;
    return computePurchaseRateBreakdown(rate);
  }, [rate]);

  const needsHandling = doCalculationAsPer === "BASIC_MINUS_HANDLING";
  const blockRequired = isBlockAmountRequired(
    doCalculationAsPer || null,
  );

  const handlingBreakdown = useMemo(() => {
    if (!needsHandling) return null;
    return computeDoRateMinusHandling(rate, handlingCharge);
  }, [needsHandling, rate, handlingCharge]);

  const previewDoRate = useMemo(() => {
    if (!doCalculationAsPer) return null;
    return resolveDoRate(
      doCalculationAsPer,
      rate,
      needsHandling ? handlingCharge : null,
    );
  }, [doCalculationAsPer, rate, needsHandling, handlingCharge]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);

    if (!doCalculationAsPer) {
      setError("Select DO Calculation as per");
      setSaving(false);
      return;
    }
    if (needsHandling && handlingCharge === "") {
      setError("Handling charge is required for this DO calculation");
      setSaving(false);
      return;
    }
    if (blockRequired && blockAmount === "") {
      setError("Block Amount is required for this DO calculation");
      setSaving(false);
      return;
    }

    try {
      throwIfActionError(
        await createRegularPurchaseOrder({
          poNumber: String(fd.get("poNumber") || ""),
          importerId: String(fd.get("importerId") || ""),
          vesselId: String(fd.get("vesselId") || ""),
          orderDate: String(fd.get("orderDate") || "") || null,
          qualityClassId: selectedVessel?.qualityClassId || null,
          rate: rate || null,
          quantity: String(fd.get("quantity") || ""),
          doCalculationAsPer,
          handlingCharge: needsHandling ? handlingCharge : null,
          blockAmount: blockAmount === "" ? null : blockAmount,
        }),
      );

      router.push(`/purchase-orders`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={onSubmit} className="form-grid form-grid-plain">
        <label>Purchase Order Number</label>
        <input
          name="poNumber"
          required
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="PO 0001"
        />

        <label>Order Date</label>
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

        <label>Basic Rate</label>
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
          <RateBreakdownFields breakdown={rateBreakdown} />
        )}

        <label>DO Calculation as per</label>
        <select
          name="doCalculationAsPer"
          required
          value={doCalculationAsPer}
          onChange={(e) =>
            setDoCalculationAsPer(
              (e.target.value || "") as DoCalculationAsPer | "",
            )
          }
        >
          <option value="">Select</option>
          {DO_CALCULATION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.title}
            </option>
          ))}
        </select>

        {needsHandling && (
          <>
            <label>
              Handling Charge <span className="field-required">*</span>
            </label>
            <div className="field-with-unit field-with-prefix">
              <span className="field-unit">Rs</span>
              <input
                name="handlingCharge"
                type="number"
                step="0.01"
                min="0"
                required
                value={handlingCharge}
                onChange={(e) => setHandlingCharge(e.target.value)}
                placeholder="e.g. 350"
              />
            </div>
          </>
        )}

        {doCalculationAsPer && (
          <>
            <label>DO Rate</label>
            <div className="do-calc-preview">
              {needsHandling ? (
                handlingBreakdown ? (
                  <>
                    <div className="do-calc-preview-formula">
                      <span>{handlingBreakdown.basic}</span>
                      <span className="do-calc-op">−</span>
                      <span className="do-calc-paren">
                        ({handlingBreakdown.handling}
                        <span className="do-calc-op">+</span>
                        {handlingBreakdown.handlingGst})
                      </span>
                      <span className="do-calc-op">=</span>
                      <strong className="do-calc-result">
                        {handlingBreakdown.doRate}
                      </strong>
                    </div>
                    <p className="do-calc-preview-hint">
                      Handling GST @ 18% = {handlingBreakdown.handlingGst}
                    </p>
                  </>
                ) : (
                  <p className="do-calc-preview-hint">
                    Enter basic rate and handling charge to preview DO rate
                  </p>
                )
              ) : previewDoRate != null ? (
                <div className="do-calc-preview-formula">
                  <strong className="do-calc-result">{previewDoRate}</strong>
                </div>
              ) : (
                <p className="do-calc-preview-hint">
                  Enter basic rate to preview DO rate
                </p>
              )}
            </div>
          </>
        )}

        <label>
          Block Amount
          {blockRequired && <span className="field-required"> *</span>}
        </label>
        <div className="field-with-unit field-with-prefix">
          <span className="field-unit">Rs</span>
          <input
            name="blockAmount"
            type="number"
            step="0.01"
            min="0"
            required={blockRequired}
            value={blockAmount}
            onChange={(e) => setBlockAmount(e.target.value)}
            placeholder={blockRequired ? "Required" : "Optional"}
          />
        </div>

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
