"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import {
  updateTransportChecklist,
  type TransportEngineRow,
} from "@/lib/actions/transportEngine";
import {
  capitalizeName,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatLorryNumber,
  formatRs,
} from "@/lib/domain/format";

function formatChecklistYes(value: boolean): string {
  return value ? "Yes" : "—";
}

function isChecklistComplete(row: {
  biltyHardCopy: boolean;
  transportInvoiceNo: string | null;
  invoiceHardCopy: boolean;
  softCopyStatus: boolean;
  entryInTally: boolean;
}): boolean {
  return (
    row.biltyHardCopy &&
    Boolean(row.transportInvoiceNo?.trim()) &&
    row.invoiceHardCopy &&
    row.softCopyStatus &&
    row.entryInTally
  );
}

function distinctTrimmed(values: Array<string | null | undefined>): string[] {
  const names = new Set<string>();
  for (const value of values) {
    if (value?.trim()) names.add(value.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function TransportEngineClient({
  initialRows,
}: {
  initialRows: TransportEngineRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [prevInitial, setPrevInitial] = useState(initialRows);
  if (initialRows !== prevInitial) {
    setPrevInitial(initialRows);
    setRows(initialRows);
  }

  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [customerFilter, setCustomerFilter] = useState("");
  const [transporterFilter, setTransporterFilter] = useState("");
  const [completeFilter, setCompleteFilter] = useState<"" | "complete" | "pending">(
    "",
  );

  const [editRow, setEditRow] = useState<TransportEngineRow | null>(null);
  const [biltyHardCopy, setBiltyHardCopy] = useState(false);
  const [transportInvoiceNo, setTransportInvoiceNo] = useState("");
  const [invoiceHardCopy, setInvoiceHardCopy] = useState(false);
  const [entryInTally, setEntryInTally] = useState(false);
  const [saving, setSaving] = useState(false);

  const customerOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.customerName)),
    [rows],
  );
  const transporterOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.transporterName)),
    [rows],
  );

  const hasActiveFilters = Boolean(
    customerFilter || transporterFilter || completeFilter,
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (
        customerFilter &&
        (row.customerName?.trim() ?? "") !== customerFilter
      ) {
        return false;
      }
      if (
        transporterFilter &&
        (row.transporterName?.trim() ?? "") !== transporterFilter
      ) {
        return false;
      }
      if (completeFilter) {
        const complete = isChecklistComplete(row);
        if (completeFilter === "complete" && !complete) return false;
        if (completeFilter === "pending" && complete) return false;
      }
      return true;
    });
  }, [rows, customerFilter, transporterFilter, completeFilter]);

  function openEdit(row: TransportEngineRow) {
    setEditRow(row);
    setBiltyHardCopy(row.biltyHardCopy);
    setTransportInvoiceNo(row.transportInvoiceNo ?? "");
    setInvoiceHardCopy(row.invoiceHardCopy);
    setEntryInTally(row.entryInTally);
    setError(null);
  }

  function closeEdit() {
    if (saving) return;
    setEditRow(null);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editRow) return;
    setError(null);
    setSaving(true);
    try {
      const result = await updateTransportChecklist(editRow.id, {
        biltyHardCopy,
        transportInvoiceNo:
          transportInvoiceNo.trim() === "" ? null : transportInvoiceNo,
        invoiceHardCopy,
        softCopyStatus: editRow.softCopyStatus,
        entryInTally,
      });
      setRows((prev) =>
        prev.map((row) =>
          row.id === editRow.id
            ? {
                ...row,
                biltyHardCopy: result.biltyHardCopy,
                transportInvoiceNo: result.transportInvoiceNo,
                invoiceHardCopy: result.invoiceHardCopy,
                softCopyStatus: result.softCopyStatus,
                entryInTally: result.entryInTally,
              }
            : row,
        ),
      );
      setEditRow(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && !editRow && <p className="form-error">{error}</p>}

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Customer
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
          >
            <option value="">All</option>
            {customerOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Transporter
          <select
            value={transporterFilter}
            onChange={(e) => setTransporterFilter(e.target.value)}
          >
            <option value="">All</option>
            {transporterOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Checklist
          <select
            value={completeFilter}
            onChange={(e) =>
              setCompleteFilter(e.target.value as "" | "complete" | "pending")
            }
          >
            <option value="">All</option>
            <option value="complete">Complete</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setCustomerFilter("");
              setTransporterFilter("");
              setCompleteFilter("");
            }}
          >
            Clear
          </button>
        )}
      </form>

      <div className="table-wrap table-wrap-scroll">
        <table className="data payments-table transport-engine-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Sale invoice</th>
              <th>Lorry number</th>
              <th className="cell-num">Loading weight (MT)</th>
              <th className="cell-num">Receiving weight (MT)</th>
              <th className="cell-num">Diff in weight (MT)</th>
              <th>Customer name</th>
              <th>Transporter name</th>
              <th className="cell-num">Freight per ton</th>
              <th className="cell-num">Freight amount</th>
              <th className="cell-center">Bilty hard copy</th>
              <th className="cell-center">Invoice hard copy</th>
              <th className="cell-center">Entry in Tally</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => {
              const complete = isChecklistComplete(row);
              const lorry = formatLorryNumber(row.lorryNumber);
              return (
                <tr key={row.id}>
                  <td>{formatDateDdMmYyyy(row.dispatchDate)}</td>
                  <td
                    className={
                      row.saleInvoiceNumber ? undefined : "cell-center"
                    }
                  >
                    {row.saleInvoiceNumber ?? "—"}
                  </td>
                  <td className={lorry ? undefined : "cell-center"}>
                    {lorry ?? "—"}
                  </td>
                  <td className="cell-num">
                    {formatDispatchMt(row.loadingWeight)}
                  </td>
                  <td
                    className={
                      row.receivingWeight != null ? "cell-num" : "cell-center"
                    }
                  >
                    {formatDispatchMt(row.receivingWeight)}
                  </td>
                  <td
                    className={
                      row.diffInWeight != null ? "cell-num" : "cell-center"
                    }
                  >
                    {formatDispatchMt(row.diffInWeight)}
                  </td>
                  <td className={row.customerName ? undefined : "cell-center"}>
                    {row.customerName
                      ? (capitalizeName(row.customerName) ?? row.customerName)
                      : "—"}
                  </td>
                  <td
                    className={
                      row.transporterName ? undefined : "cell-center"
                    }
                  >
                    {row.transporterName
                      ? (capitalizeName(row.transporterName) ??
                        row.transporterName)
                      : "—"}
                  </td>
                  <td className="cell-num">
                    {row.freightPerTon != null
                      ? formatRs(row.freightPerTon)
                      : "—"}
                  </td>
                  <td className="cell-num">
                    {row.freightAmount != null
                      ? formatRs(row.freightAmount)
                      : "—"}
                  </td>
                  <td className="cell-center">
                    {formatChecklistYes(row.biltyHardCopy)}
                  </td>
                  <td className="cell-center">
                    {formatChecklistYes(row.invoiceHardCopy)}
                  </td>
                  <td className="cell-center">
                    {formatChecklistYes(row.entryInTally)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className={`btn btn-sm ${
                        complete
                          ? "btn-checklist-complete"
                          : "btn-checklist-pending"
                      }`}
                      onClick={() => openEdit(row)}
                      disabled={pending && saving}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={14}>
                  {rows.length === 0
                    ? "No dispatches yet."
                    : "No dispatches match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={editRow != null}
        title="Transport checklist"
        onClose={closeEdit}
      >
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={onSubmit} className="form-grid form-grid-plain">
          <label htmlFor="te-bilty">Bilty hard copy</label>
          <input
            id="te-bilty"
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={biltyHardCopy}
            onChange={(e) => setBiltyHardCopy(e.target.checked)}
          />

          <label htmlFor="te-invoice-no">Transport invoice no.</label>
          <input
            id="te-invoice-no"
            value={transportInvoiceNo}
            onChange={(e) => setTransportInvoiceNo(e.target.value)}
            placeholder="Transport invoice number"
            autoFocus
          />

          <label htmlFor="te-hard">Invoice hard copy</label>
          <input
            id="te-hard"
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={invoiceHardCopy}
            onChange={(e) => setInvoiceHardCopy(e.target.checked)}
          />

          <label htmlFor="te-tally">Entry in Tally</label>
          <input
            id="te-tally"
            type="checkbox"
            className="dispatch-bool-toggle"
            checked={entryInTally}
            onChange={(e) => setEntryInTally(e.target.checked)}
          />

          <div />
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeEdit}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
