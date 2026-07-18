"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DispatchTerms } from "@/generated/prisma";
import {
  createDispatch,
  createOpenOrderDispatch,
} from "@/lib/actions/dispatch";

type OrderOpt = {
  poNumber: string;
  balanceOrder: string | null;
  customer: { name: string } | null;
};

type PurchaseOpt = {
  poNumber: string;
  balanceOrder: string | null;
  importer: { name: string } | null;
  vessel: { vesselName: string } | null;
};

type Opt = { id: string; name: string };

type VesselOpt = {
  id: string;
  vesselName: string;
};

export function NewDispatchForm({
  orders,
  purchaseOrders,
  transporters,
  customers,
  importers,
  vessels,
  staff,
  suggestedPo,
  suggestedPurchasePo,
  onCancel,
  onSuccess,
}: {
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  transporters: Opt[];
  customers: Opt[];
  importers: Opt[];
  vessels: VesselOpt[];
  staff: Opt[];
  suggestedPo: string;
  suggestedPurchasePo: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"existing" | "open">("existing");
  const [purchaseMode, setPurchaseMode] = useState<"existing" | "open">(
    "existing",
  );
  const [poNumber, setPoNumber] = useState("");
  const [openPoNumber, setOpenPoNumber] = useState(suggestedPo);
  const [orderById, setOrderById] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [purchasePoNumber, setPurchasePoNumber] = useState("");
  const [openPurchasePoNumber, setOpenPurchasePoNumber] =
    useState(suggestedPurchasePo);
  const [importerId, setImporterId] = useState("");
  const [vesselId, setVesselId] = useState("");
  const [dispatchedQuantity, setDispatchedQuantity] = useState("");
  const [dispatchTerms, setDispatchTerms] = useState<DispatchTerms>(
    DispatchTerms.EX_PORT,
  );
  const [lorryNumber, setLorryNumber] = useState("");
  const [transporterId, setTransporterId] = useState("");
  const [freight, setFreight] = useState("");
  const [saleInvoiceNumber, setSaleInvoiceNumber] = useState("");
  const [purchaseInvoiceNumber, setPurchaseInvoiceNumber] = useState("");
  const [dispatchDate, setDispatchDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [orderSearch, setOrderSearch] = useState("");
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.poNumber === poNumber) ?? null,
    [orders, poNumber],
  );
  const selectedPurchase = useMemo(
    () =>
      purchaseOrders.find((p) => p.poNumber === purchasePoNumber) ?? null,
    [purchaseOrders, purchasePoNumber],
  );

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.poNumber.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q),
    );
  }, [orders, orderSearch]);

  const filteredPurchases = useMemo(() => {
    const q = purchaseSearch.trim().toLowerCase();
    if (!q) return purchaseOrders;
    return purchaseOrders.filter(
      (p) =>
        p.poNumber.toLowerCase().includes(q) ||
        p.importer?.name?.toLowerCase().includes(q) ||
        p.vessel?.vesselName?.toLowerCase().includes(q),
    );
  }, [purchaseOrders, purchaseSearch]);

  const filteredVessels = vessels;
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const openPurchase =
        purchaseMode === "open"
          ? {
              poNumber: openPurchasePoNumber,
              importerId,
              vesselId,
            }
          : undefined;
      const existingPurchasePo =
        purchaseMode === "existing" ? purchasePoNumber : undefined;

      if (purchaseMode === "existing" && !purchasePoNumber) {
        throw new Error("Select a purchase order");
      }
      if (purchaseMode === "open") {
        if (!openPurchasePoNumber.trim()) {
          throw new Error("Purchase PO number is required");
        }
        if (!importerId) throw new Error("Importer is required");
        if (!vesselId) throw new Error("Vessel is required");
      }

      const shared = {
        purchasePoNumber: existingPurchasePo,
        openPurchase,
        dispatchDate,
        dispatchedQuantity,
        dispatchTerms,
        lorryNumber: lorryNumber || null,
        transporterId: transporterId || null,
        freight: freight || null,
        saleInvoiceNumber: saleInvoiceNumber || null,
        purchaseInvoiceNumber: purchaseInvoiceNumber || null,
      };

      if (mode === "open") {
        if (!customerId) throw new Error("Customer is required");
        if (!orderById) throw new Error("Deal by (staff) is required");
        await createOpenOrderDispatch({
          poNumber: openPoNumber,
          orderById,
          customerId,
          ...shared,
        });
      } else {
        if (!poNumber) throw new Error("Select an existing sale PO");
        await createDispatch({
          poNumber,
          ...shared,
        });
      }
      if (onSuccess) {
        onSuccess();
        router.refresh();
      } else {
        router.push("/dispatches");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <div className="option-cards" role="radiogroup" aria-label="Sale order type">
        <button
          type="button"
          role="radio"
          aria-checked={mode === "existing"}
          className={`option-card${mode === "existing" ? " option-card-selected" : ""}`}
          onClick={() => setMode("existing")}
        >
          <span className="option-card-title">Existing sale PO</span>
          <span className="option-card-desc">
            Link dispatch to a sale order already on file
          </span>
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "open"}
          className={`option-card${mode === "open" ? " option-card-selected" : ""}`}
          onClick={() => setMode("open")}
        >
          <span className="option-card-title">Open sale order</span>
          <span className="option-card-desc">
            Create a new open order, then dispatch against purchase stock
          </span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="form-grid form-grid-plain">
        {mode === "existing" ? (
          <>
            <label>Search sale PO</label>
            <input
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Filter by PO or customer"
            />
            <label>Sale PO number</label>
            <select
              required
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            >
              <option value="">Select…</option>
              {filteredOrders.map((o) => (
                <option key={o.poNumber} value={o.poNumber}>
                  {o.poNumber} — {o.customer?.name} (bal{" "}
                  {o.balanceOrder != null ? `${o.balanceOrder} MT` : "n/a"})
                </option>
              ))}
            </select>
            {selectedOrder && (
              <>
                <label>Sale balance</label>
                <div className="text-sm">
                  {selectedOrder.balanceOrder != null
                    ? `${selectedOrder.balanceOrder} MT`
                    : "—"}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <label>Sale PO number</label>
            <input
              required
              value={openPoNumber}
              onChange={(e) => setOpenPoNumber(e.target.value)}
            />
            <label>Customer</label>
            <select
              required
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label>Deal by (staff)</label>
            <select
              required
              value={orderById}
              onChange={(e) => setOrderById(e.target.value)}
            >
              <option value="">Select…</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              Creates an OPEN sale order with quantity null, then the dispatch.
            </p>
          </>
        )}

        <div
          className="option-cards"
          role="radiogroup"
          aria-label="Purchase order type"
          style={{ gridColumn: "1 / -1" }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={purchaseMode === "existing"}
            className={`option-card${purchaseMode === "existing" ? " option-card-selected" : ""}`}
            onClick={() => setPurchaseMode("existing")}
          >
            <span className="option-card-title">Existing purchase PO</span>
            <span className="option-card-desc">
              Link dispatch to a purchase order already on file
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={purchaseMode === "open"}
            className={`option-card${purchaseMode === "open" ? " option-card-selected" : ""}`}
            onClick={() => setPurchaseMode("open")}
          >
            <span className="option-card-title">Open purchase order</span>
            <span className="option-card-desc">
              Create a new open purchase order, then dispatch from it
            </span>
          </button>
        </div>

        {purchaseMode === "existing" ? (
          <>
            <label>Search purchase PO</label>
            <input
              value={purchaseSearch}
              onChange={(e) => setPurchaseSearch(e.target.value)}
              placeholder="Filter by PO, importer, or vessel"
            />

            <label>Purchase order</label>
            <select
              required
              value={purchasePoNumber}
              onChange={(e) => setPurchasePoNumber(e.target.value)}
            >
              <option value="">Select…</option>
              {filteredPurchases.map((p) => (
                <option key={p.poNumber} value={p.poNumber}>
                  {p.poNumber} — {p.importer?.name ?? "?"} —{" "}
                  {p.vessel?.vesselName ?? "?"} (bal{" "}
                  {p.balanceOrder != null ? `${p.balanceOrder} MT` : "n/a"})
                </option>
              ))}
            </select>
            {selectedPurchase && (
              <>
                <label>Purchase balance</label>
                <div className="text-sm">
                  {selectedPurchase.balanceOrder != null
                    ? `${selectedPurchase.balanceOrder} MT`
                    : "—"}
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <label>Purchase PO number</label>
            <input
              required
              value={openPurchasePoNumber}
              onChange={(e) => setOpenPurchasePoNumber(e.target.value)}
            />
            <label>Importer</label>
            <select
              required
              value={importerId}
              onChange={(e) => setImporterId(e.target.value)}
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
              required
              value={vesselId}
              onChange={(e) => setVesselId(e.target.value)}
            >
              <option value="">Select…</option>
              {filteredVessels.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vesselName}
                </option>
              ))}
            </select>
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              Creates an OPEN purchase order with quantity null, then the
              dispatch against it.
            </p>
          </>
        )}

        <label>Dispatched quantity</label>
        <div className="field-with-unit">
          <input
            required
            type="number"
            step="any"
            min="0.0001"
            value={dispatchedQuantity}
            onChange={(e) => setDispatchedQuantity(e.target.value)}
          />
          <span className="field-unit">MT</span>
        </div>

        <label>Dispatch date</label>
        <input
          required
          type="date"
          value={dispatchDate}
          onChange={(e) => setDispatchDate(e.target.value)}
        />

        <label>Delivery terms</label>
        <div
          className="segment-control"
          role="radiogroup"
          aria-label="Delivery terms"
        >
          <button
            type="button"
            role="radio"
            aria-checked={dispatchTerms === DispatchTerms.FOR}
            className={`segment-option${dispatchTerms === DispatchTerms.FOR ? " segment-option-selected" : ""}`}
            onClick={() => setDispatchTerms(DispatchTerms.FOR)}
          >
            FOR
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={dispatchTerms === DispatchTerms.EX_PORT}
            className={`segment-option${dispatchTerms === DispatchTerms.EX_PORT ? " segment-option-selected" : ""}`}
            onClick={() => {
              setDispatchTerms(DispatchTerms.EX_PORT);
              setTransporterId("");
              setFreight("");
            }}
          >
            Ex-Port
          </button>
        </div>

        <label>Lorry number</label>
        <input
          value={lorryNumber}
          onChange={(e) => setLorryNumber(e.target.value)}
        />

        <label>Sale invoice</label>
        <input
          value={saleInvoiceNumber}
          onChange={(e) => setSaleInvoiceNumber(e.target.value)}
          placeholder="Optional — can add later"
        />

        <label>Purchase invoice</label>
        <input
          value={purchaseInvoiceNumber}
          onChange={(e) => setPurchaseInvoiceNumber(e.target.value)}
          placeholder="Optional — can add later"
        />

        <label>Transporter</label>
        {dispatchTerms === DispatchTerms.FOR ? (
          <select
            required
            value={transporterId}
            onChange={(e) => setTransporterId(e.target.value)}
          >
            <option value="">Select…</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-sm text-neutral-600">Not required for Ex-Port</div>
        )}

        {dispatchTerms === DispatchTerms.FOR ? (
          <>
            <label>Freight</label>
            <div className="field-with-unit">
              <input
                required
                type="number"
                step="any"
                min="0"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
                placeholder="Per MT"
              />
              <span className="field-unit">Rs/MT</span>
            </div>
            <p
              className="text-sm text-neutral-600"
              style={{ gridColumn: "1 / -1" }}
            >
              FOR: sale rate includes freight. Freight is subtracted to get the
              goods price for profit.
            </p>
          </>
        ) : (
          <>
            <div />
            <div />
          </>
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
            {saving ? "Saving…" : "Create dispatch"}
          </button>
        </div>
      </form>
    </div>
  );
}
