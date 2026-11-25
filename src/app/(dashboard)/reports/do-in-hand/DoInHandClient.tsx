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

export function DoInHandClient({ purchaseOrders, funds }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(funds);
  const [unlockedIds, setUnlockedIds] = useState<Record<string, boolean>>({});
  const [draftVessel, setDraftVessel] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setRows(funds);
  }, [funds]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.doStatus !== b.doStatus) {
        return a.doStatus === "PENDING" ? -1 : 1;
      }
      return b.dateIso.localeCompare(a.dateIso);
    });
  }, [rows]);

  const poExportColumns = [
    { key: "date", header: "Date" },
    { key: "vendor", header: "Vendor" },
    { key: "vessel", header: "Vessel" },
    { key: "qualityClass", header: "Quality class" },
    { key: "quantity", header: "Quantity", align: "right" as const },
    { key: "dispatched", header: "Dispatched", align: "right" as const },
    { key: "closing", header: "Closing", align: "right" as const },
    { key: "balance", header: "Balance", align: "right" as const },
    { key: "basicRate", header: "Basic rate", align: "right" as const },
    { key: "finalRate", header: "Final rate", align: "right" as const },
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
    doVesselName: row.doVesselName ?? "",
    doStatus: row.doStatus === "PENDING" ? "Pending" : "Completed",
  }));

  function replaceRow(updated: DoInHandFundRow) {
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }

  function selectedVesselId(row: DoInHandFundRow): string {
    return draftVessel[row.id] ?? row.doVesselId ?? "";
  }

  function vesselEditable(row: DoInHandFundRow): boolean {
    return row.doStatus === "PENDING" || !!unlockedIds[row.id];
  }

  function beginEdit(row: DoInHandFundRow) {
    setError(null);
    setUnlockedIds((prev) => ({ ...prev, [row.id]: true }));
    setDraftVessel((prev) => ({
      ...prev,
      [row.id]: row.doVesselId ?? "",
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

    const vesselId = selectedVesselId(row).trim() || null;
    if (!vesselId) {
      setError("Select a vessel before saving");
      return;
    }

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
            rows={purchaseOrders}
          />
        </div>
        <div className="do-in-hand-table-wrap">
          <table className="data do-in-hand-po-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Vessel</th>
                <th>Quality class</th>
                <th className="num">Quantity</th>
                <th className="num">Dispatched</th>
                <th className="num">Closing</th>
                <th className="num">Balance</th>
                <th className="num">Basic rate</th>
                <th className="num">Final rate</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={10}>No purchase orders with balance.</td>
                </tr>
              ) : (
                purchaseOrders.map((row) => (
                  <tr key={row.id}>
                    <td className="cell-date">{row.date}</td>
                    <td>{row.vendor}</td>
                    <td>{row.vessel}</td>
                    <td>{row.qualityClass}</td>
                    <td className="num">{row.quantity}</td>
                    <td className="num">{row.dispatched}</td>
                    <td className="num">{row.closing}</td>
                    <td className="num">{row.balance}</td>
                    <td className="num">{row.basicRate}</td>
                    <td className="num">{row.finalRate}</td>
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
                <th>Date</th>
                <th>Vendor Name</th>
                <th>Our current a/c</th>
                <th className="num">Amount</th>
                <th>Vessel name</th>
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
