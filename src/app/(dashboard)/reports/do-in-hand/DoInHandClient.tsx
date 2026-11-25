"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateDoInHandStatus,
  updateDoInHandVessel,
  type DoInHandFundRow,
  type DoInHandPurchaseOrderRow,
} from "@/lib/actions/doInHand";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";

type Props = {
  purchaseOrders: DoInHandPurchaseOrderRow[];
  funds: DoInHandFundRow[];
};

/** Sentinel select value: fund adjusted without tying to a vessel. */
const NON_VESSEL_ADJUSTMENT = "__NON_VESSEL_ADJUSTMENT__";
const NON_VESSEL_LABEL = "Non-Vessel Adjustment";

type FundSortKey =
  | "date"
  | "vendorName"
  | "accountName"
  | "amount"
  | "doVesselName";

type PoSortKey =
  | "date"
  | "vendor"
  | "vessel"
  | "qualityClass"
  | "quantity"
  | "dispatched"
  | "balance"
  | "basicRate"
  | "finalRate"
  | "fundPaid"
  | "deliveryOrder";

type SortDir = "asc" | "desc";

const FUND_AMOUNT_KEYS = new Set<FundSortKey>(["amount"]);
const PO_AMOUNT_KEYS = new Set<PoSortKey>([
  "quantity",
  "dispatched",
  "balance",
  "basicRate",
  "finalRate",
  "fundPaid",
  "deliveryOrder",
]);

function numericValue(value: string | null | undefined): number {
  if (value == null || value === "" || value === "—") return 0;
  const cleaned = value.replace(/,/g, "").replace(/[^\d.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function compareText(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  return (a?.trim() ?? "").localeCompare(b?.trim() ?? "", undefined, {
    sensitivity: "base",
  });
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function fundVesselLabel(row: DoInHandFundRow): string {
  if (row.doVesselName) return row.doVesselName;
  if (row.doStatus === "COMPLETED") return NON_VESSEL_LABEL;
  return "";
}

export function DoInHandClient({ purchaseOrders, funds }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(funds);
  const [unlockedIds, setUnlockedIds] = useState<Record<string, boolean>>({});
  const [draftVessel, setDraftVessel] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [fundSortKey, setFundSortKey] = useState<FundSortKey | null>(null);
  const [fundSortDir, setFundSortDir] = useState<SortDir>("desc");
  const [poSortKey, setPoSortKey] = useState<PoSortKey | null>(null);
  const [poSortDir, setPoSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setRows(funds);
  }, [funds]);

  function toggleFundSort(key: FundSortKey) {
    if (fundSortKey === key) {
      setFundSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setFundSortKey(key);
    setFundSortDir(key === "date" || key === "amount" ? "desc" : "asc");
  }

  function togglePoSort(key: PoSortKey) {
    if (poSortKey === key) {
      setPoSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setPoSortKey(key);
    setPoSortDir(
      key === "date" || PO_AMOUNT_KEYS.has(key) ? "desc" : "asc",
    );
  }

  const sortedRows = useMemo(() => {
    const next = [...rows];
    if (!fundSortKey) {
      return next.sort((a, b) => {
        if (a.doStatus !== b.doStatus) {
          return a.doStatus === "PENDING" ? -1 : 1;
        }
        return b.dateIso.localeCompare(a.dateIso);
      });
    }

    const dir = fundSortDir === "asc" ? 1 : -1;
    return next.sort((a, b) => {
      if (fundSortKey === "date") {
        return a.dateIso.localeCompare(b.dateIso) * dir;
      }
      if (FUND_AMOUNT_KEYS.has(fundSortKey)) {
        return (numericValue(a.amount) - numericValue(b.amount)) * dir;
      }
      if (fundSortKey === "doVesselName") {
        return compareText(fundVesselLabel(a), fundVesselLabel(b)) * dir;
      }
      return compareText(a[fundSortKey], b[fundSortKey]) * dir;
    });
  }, [rows, fundSortKey, fundSortDir]);

  const sortedPurchaseOrders = useMemo(() => {
    if (!poSortKey) return purchaseOrders;
    const dir = poSortDir === "asc" ? 1 : -1;
    return [...purchaseOrders].sort((a, b) => {
      if (poSortKey === "date") {
        return a.dateIso.localeCompare(b.dateIso) * dir;
      }
      if (PO_AMOUNT_KEYS.has(poSortKey)) {
        return (
          (numericValue(a[poSortKey]) - numericValue(b[poSortKey])) * dir
        );
      }
      return compareText(a[poSortKey], b[poSortKey]) * dir;
    });
  }, [purchaseOrders, poSortKey, poSortDir]);

  const poExportColumns = [
    { key: "date", header: "Date" },
    { key: "vendor", header: "Vendor" },
    { key: "vessel", header: "Vessel" },
    { key: "qualityClass", header: "Quality class" },
    { key: "quantity", header: "Quantity", align: "right" as const },
    { key: "dispatched", header: "Dispatched", align: "right" as const },
    { key: "balance", header: "Balance", align: "right" as const },
    { key: "basicRate", header: "Basic rate", align: "right" as const },
    { key: "finalRate", header: "Final rate", align: "right" as const },
    { key: "fundPaid", header: "Fund Paid", align: "right" as const },
    { key: "deliveryOrder", header: "Delivery Order", align: "right" as const },
  ];

  const fundExportColumns = [
    { key: "date", header: "Date" },
    { key: "vendorName", header: "Vendor Name" },
    { key: "accountName", header: "Our current a/c" },
    { key: "amount", header: "Amount", align: "right" as const },
    { key: "directionLabel", header: "Type" },
    { key: "doVesselName", header: "Vessel name" },
    { key: "doStatus", header: "Status" },
  ];

  const fundExportRows = sortedRows.map((row) => ({
    date: row.date,
    vendorName: row.vendorName,
    accountName: row.accountName,
    amount: row.amount,
    directionLabel: row.directionLabel,
    doVesselName: fundVesselLabel(row),
    doStatus: row.doStatus === "PENDING" ? "Pending" : "Completed",
  }));

  function replaceRow(updated: DoInHandFundRow) {
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  function selectedVesselId(row: DoInHandFundRow): string {
    if (draftVessel[row.id] !== undefined) return draftVessel[row.id];
    if (row.doVesselId) return row.doVesselId;
    if (row.doStatus === "COMPLETED") return NON_VESSEL_ADJUSTMENT;
    return "";
  }

  function vesselEditable(row: DoInHandFundRow): boolean {
    return row.doStatus === "PENDING" || !!unlockedIds[row.id];
  }

  function beginEdit(row: DoInHandFundRow) {
    setError(null);
    setUnlockedIds((prev) => ({ ...prev, [row.id]: true }));
    setDraftVessel((prev) => ({
      ...prev,
      [row.id]: row.doVesselId
        ? row.doVesselId
        : row.doStatus === "COMPLETED"
          ? NON_VESSEL_ADJUSTMENT
          : "",
    }));
  }

  function cancelEdit(row: DoInHandFundRow) {
    setUnlockedIds((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
    setDraftVessel((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
  }

  function onSave(row: DoInHandFundRow) {
    setError(null);

    if (row.doStatus === "COMPLETED" && !unlockedIds[row.id]) {
      setBusyId(row.id);
      startTransition(async () => {
        try {
          const updated = await updateDoInHandStatus({
            paymentId: row.id,
            status: "PENDING",
          });
          replaceRow(updated);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not update");
        } finally {
          setBusyId(null);
        }
      });
      return;
    }

    const rawSelection = selectedVesselId(row).trim();
    if (!rawSelection) {
      setError("Select a vessel or Non-Vessel Adjustment before saving");
      return;
    }

    const isNonVessel = rawSelection === NON_VESSEL_ADJUSTMENT;
    const vesselId = isNonVessel ? null : rawSelection;

    setBusyId(row.id);
    startTransition(async () => {
      try {
        let updated = row;
        if (vesselId !== row.doVesselId) {
          updated = await updateDoInHandVessel({
            paymentId: row.id,
            vesselId,
          });
        }
        if (updated.doStatus !== "COMPLETED") {
          updated = await updateDoInHandStatus({
            paymentId: row.id,
            status: "COMPLETED",
          });
        }
        replaceRow(updated);
        setUnlockedIds((prev) => {
          const next = { ...prev };
          delete next[row.id];
          return next;
        });
        setDraftVessel((prev) => {
          const next = { ...prev };
          delete next[row.id];
          return next;
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not save");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <div className="do-in-hand-page">
      <section className="do-in-hand-panel">
        <div className="do-in-hand-panel-head">
          <h2 className="do-in-hand-panel-title">Running purchase orders</h2>
          <TableDownloadButtons
            title="Running purchase orders"
            filenameBase="do-in-hand-running-pos"
            columns={poExportColumns}
            rows={sortedPurchaseOrders}
          />
        </div>
        <div className="do-in-hand-table-wrap">
          <table className="data do-in-hand-po-table">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("date")}
                  >
                    Date
                    {sortIndicator(poSortKey === "date", poSortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("vendor")}
                  >
                    Vendor
                    {sortIndicator(poSortKey === "vendor", poSortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("vessel")}
                  >
                    Vessel
                    {sortIndicator(poSortKey === "vessel", poSortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("qualityClass")}
                  >
                    Quality class
                    {sortIndicator(poSortKey === "qualityClass", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("quantity")}
                  >
                    Quantity
                    {sortIndicator(poSortKey === "quantity", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("dispatched")}
                  >
                    Dispatched
                    {sortIndicator(poSortKey === "dispatched", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("balance")}
                  >
                    Balance
                    {sortIndicator(poSortKey === "balance", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("basicRate")}
                  >
                    Basic rate
                    {sortIndicator(poSortKey === "basicRate", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("finalRate")}
                  >
                    Final rate
                    {sortIndicator(poSortKey === "finalRate", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("fundPaid")}
                  >
                    Fund Paid
                    {sortIndicator(poSortKey === "fundPaid", poSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => togglePoSort("deliveryOrder")}
                  >
                    Delivery Order
                    {sortIndicator(poSortKey === "deliveryOrder", poSortDir)}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPurchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={11}>No purchase orders with balance.</td>
                </tr>
              ) : (
                sortedPurchaseOrders.map((row) => (
                  <tr key={row.id}>
                    <td className="cell-date">{row.date}</td>
                    <td>{row.vendor}</td>
                    <td>{row.vessel}</td>
                    <td>{row.qualityClass}</td>
                    <td className="num">{row.quantity}</td>
                    <td className="num">{row.dispatched}</td>
                    <td className="num">{row.balance}</td>
                    <td className="num">{row.basicRate}</td>
                    <td className="num">{row.finalRate}</td>
                    <td className="num">{row.fundPaid}</td>
                    <td className="num">{row.deliveryOrder}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="do-in-hand-panel">
        <div className="do-in-hand-panel-head">
          <h2 className="do-in-hand-panel-title">Vendor funds</h2>
          <TableDownloadButtons
            title="Vendor funds"
            filenameBase="do-in-hand-funds"
            columns={fundExportColumns}
            rows={fundExportRows}
          />
        </div>

        {error ? <div className="error-box do-in-hand-error">{error}</div> : null}

        <div className="do-in-hand-table-wrap">
          <table className="data do-in-hand-fund-table">
            <thead>
              <tr>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleFundSort("date")}
                  >
                    Date
                    {sortIndicator(fundSortKey === "date", fundSortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleFundSort("vendorName")}
                  >
                    Vendor Name
                    {sortIndicator(fundSortKey === "vendorName", fundSortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleFundSort("accountName")}
                  >
                    Our current a/c
                    {sortIndicator(fundSortKey === "accountName", fundSortDir)}
                  </button>
                </th>
                <th className="num">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleFundSort("amount")}
                  >
                    Amount
                    {sortIndicator(fundSortKey === "amount", fundSortDir)}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleFundSort("doVesselName")}
                  >
                    Vessel name
                    {sortIndicator(fundSortKey === "doVesselName", fundSortDir)}
                  </button>
                </th>
                <th className="cell-center">Save</th>
                <th className="cell-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    No fund paid or fund received for vendors with open balance
                    purchase orders.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row) => {
                  const busy = pending && busyId === row.id;
                  const editable = vesselEditable(row);
                  const pendingDo = row.doStatus === "PENDING";
                  const unlocked = !!unlockedIds[row.id];
                  return (
                    <tr
                      key={row.id}
                      className={
                        pendingDo
                          ? "do-in-hand-row-pending"
                          : "do-in-hand-row-completed"
                      }
                    >
                      <td className="cell-date">{row.date}</td>
                      <td>
                        <div className="do-in-hand-vendor-cell">
                          <span>{row.vendorName}</span>
                          <span
                            className={
                              row.direction === "RECEIVED"
                                ? "fund-type-in"
                                : "fund-type-out"
                            }
                          >
                            {row.directionLabel}
                          </span>
                        </div>
                      </td>
                      <td>{row.accountName}</td>
                      <td className="num">{row.amount}</td>
                      <td>
                        <select
                          className="do-in-hand-vessel-select"
                          value={selectedVesselId(row)}
                          onChange={(e) =>
                            setDraftVessel((prev) => ({
                              ...prev,
                              [row.id]: e.target.value,
                            }))
                          }
                          disabled={busy || !editable}
                          aria-label={`Vessel for ${row.vendorName}`}
                        >
                          <option value="">Select vessel</option>
                          <option value={NON_VESSEL_ADJUSTMENT}>
                            {NON_VESSEL_LABEL}
                          </option>
                          {row.vessels.map((vessel) => (
                            <option key={vessel.id} value={vessel.id}>
                              {vessel.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="cell-center">
                        <button
                          type="button"
                          className={
                            pendingDo || unlocked
                              ? "btn btn-sm btn-checklist-pending"
                              : "btn btn-sm btn-checklist-complete"
                          }
                          onClick={() => onSave(row)}
                          disabled={busy}
                          title={
                            pendingDo || unlocked
                              ? "Save vessel and mark completed"
                              : "Mark pending again"
                          }
                        >
                          {busy
                            ? "…"
                            : pendingDo || unlocked
                              ? "Save"
                              : "Completed"}
                        </button>
                      </td>
                      <td className="cell-center">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() =>
                            unlocked ? cancelEdit(row) : beginEdit(row)
                          }
                          disabled={busy || pendingDo}
                          title={
                            pendingDo
                              ? "Vessel can be changed directly while pending"
                              : unlocked
                                ? "Cancel vessel edit"
                                : "Edit vessel"
                          }
                        >
                          {unlocked ? "Cancel" : "Edit"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
