"use client";

import { useMemo, useState } from "react";
import { DispatchTerms } from "@/generated/prisma";
import { UpdateTableInteraction } from "@/components/UpdateTableInteraction";
import { EditTransportChecklistButton } from "@/components/EditTransportChecklistButton";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import {
  type TransportEngineRow,
} from "@/lib/actions/transportEngine";
import {
  capitalizeName,
  formatDateDdMmYyyy,
  formatDispatchMt,
  formatDispatchTerms,
  formatLorryNumber,
  formatAmount,
} from "@/lib/domain/format";
import { displayDispatchNumber, parseDispatchSequence } from "@/lib/domain/dispatchNumbers";
import { isTransportChecklistComplete } from "@/lib/domain/dispatchChecklist";

type TransportSortKey =
  | "date"
  | "dispatchNumber"
  | "diffInWeight"
  | "deliveryTerms"
  | "transporterName";
type SortDir = "asc" | "desc";

function formatChecklistYes(value: boolean): string {
  return value ? "Yes" : "—";
}

function distinctTrimmed(values: Array<string | null | undefined>): string[] {
  const names = new Set<string>();
  for (const value of values) {
    if (value?.trim()) names.add(value.trim());
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

function sortIndicator(active: boolean, dir: SortDir): string {
  if (!active) return "";
  return dir === "asc" ? " ↑" : " ↓";
}

function compareNullableNumber(
  a: string | null | undefined,
  b: string | null | undefined,
): number {
  const an = a == null || a === "" ? null : Number(a);
  const bn = b == null || b === "" ? null : Number(b);
  const aValid = an != null && Number.isFinite(an);
  const bValid = bn != null && Number.isFinite(bn);
  if (!aValid && !bValid) return 0;
  if (!aValid) return 1;
  if (!bValid) return -1;
  return an - bn;
}

function compareText(a: string | null | undefined, b: string | null | undefined): number {
  const left = a?.trim() ?? "";
  const right = b?.trim() ?? "";
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return left.localeCompare(right);
}

function buildTransportEditRowSummary(row: TransportEngineRow) {
  const lorry = formatLorryNumber(row.lorryNumber);
  return {
    dispatchNumber: displayDispatchNumber(row.dispatchNumber),
    date: formatDateDdMmYyyy(row.dispatchDate),
    saleInvoice: row.saleInvoiceNumber ?? "—",
    lorryNumber: lorry ?? "—",
    loadingWeight: formatDispatchMt(row.loadingWeight),
    receivingWeight: formatDispatchMt(row.receivingWeight),
    diffInWeight: formatDispatchMt(row.diffInWeight),
    customer: row.customerName
      ? (capitalizeName(row.customerName) ?? row.customerName)
      : "—",
    portName: row.portName ?? "—",
    unloadingPlace: row.customerCity
      ? (capitalizeName(row.customerCity) ?? row.customerCity)
      : "—",
    deliveryTerms: formatDispatchTerms(row.dispatchTerms),
    transporter: row.transporterName
      ? (capitalizeName(row.transporterName) ?? row.transporterName)
      : "—",
    freightPerTon:
      row.freightPerTon != null ? formatAmount(row.freightPerTon) : "—",
    freightAmount:
      row.freightAmount != null ? formatAmount(row.freightAmount) : "—",
  };
}

export function TransportEngineClient({
  initialRows,
  exportTitle = "Transport Engine Report",
  exportFilenameBase = "transport-engine",
  variant = "report",
}: {
  initialRows: TransportEngineRow[];
  exportTitle?: string;
  exportFilenameBase?: string;
  variant?: "report" | "update";
}) {
  const [rows, setRows] = useState(initialRows);
  const [prevInitial, setPrevInitial] = useState(initialRows);
  if (initialRows !== prevInitial) {
    setPrevInitial(initialRows);
    setRows(initialRows);
  }

  const [customerFilter, setCustomerFilter] = useState("");
  const [transporterFilter, setTransporterFilter] = useState("");
  const [deliveryTermsFilter, setDeliveryTermsFilter] = useState<
    "" | DispatchTerms
  >(() => (variant === "update" ? DispatchTerms.FOR : ""));
  const [completeFilter, setCompleteFilter] = useState<"" | "complete" | "pending">(
    "",
  );
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [sortKey, setSortKey] = useState<TransportSortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const customerOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.customerName)),
    [rows],
  );
  const transporterOptions = useMemo(
    () => distinctTrimmed(rows.map((row) => row.transporterName)),
    [rows],
  );

  const hasActiveFilters = Boolean(
    customerFilter ||
      transporterFilter ||
      (deliveryTermsFilter &&
        !(variant === "update" && deliveryTermsFilter === DispatchTerms.FOR)) ||
      completeFilter ||
      dateStart ||
      dateEnd,
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
      if (deliveryTermsFilter && row.dispatchTerms !== deliveryTermsFilter) {
        return false;
      }
      if (completeFilter) {
        const complete = isTransportChecklistComplete(row);
        if (completeFilter === "complete" && !complete) return false;
        if (completeFilter === "pending" && complete) return false;
      }
      if (dateStart && row.dispatchDate < dateStart) return false;
      if (dateEnd && row.dispatchDate > dateEnd) return false;
      return true;
    });
  }, [
    rows,
    customerFilter,
    transporterFilter,
    deliveryTermsFilter,
    completeFilter,
    dateStart,
    dateEnd,
  ]);

  function toggleSort(key: TransportSortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(
      key === "date" || key === "diffInWeight" ? "desc" : "asc",
    );
  }

  const displayed = useMemo(() => {
    if (variant !== "update" || !sortKey) return filtered;
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") {
        cmp = a.dispatchDate.localeCompare(b.dispatchDate);
      } else if (sortKey === "dispatchNumber") {
        const aSeq = parseDispatchSequence(a.dispatchNumber) ?? Number.POSITIVE_INFINITY;
        const bSeq = parseDispatchSequence(b.dispatchNumber) ?? Number.POSITIVE_INFINITY;
        cmp = aSeq - bSeq;
      } else if (sortKey === "diffInWeight") {
        cmp = compareNullableNumber(a.diffInWeight, b.diffInWeight);
      } else if (sortKey === "deliveryTerms") {
        cmp = formatDispatchTerms(a.dispatchTerms).localeCompare(
          formatDispatchTerms(b.dispatchTerms),
        );
      } else {
        cmp = compareText(
          a.transporterName
            ? (capitalizeName(a.transporterName) ?? a.transporterName)
            : "",
          b.transporterName
            ? (capitalizeName(b.transporterName) ?? b.transporterName)
            : "",
        );
      }
      if (cmp !== 0) return cmp * dir;
      return a.id.localeCompare(b.id);
    });
  }, [filtered, sortKey, sortDir, variant]);

  const exportColumns = useMemo(() => {
    const base = [
      { key: "date", header: "Date" },
    { key: "saleInvoice", header: "Sale invoice" },
    { key: "lorryNumber", header: "Lorry number" },
    {
      key: "loadingWeight",
      header: "Loading weight",
      align: "right" as const,
    },
    {
      key: "receivingWeight",
      header: "Receiving weight",
      align: "right" as const,
    },
    {
      key: "diffInWeight",
      header: "Diff in weight",
      align: "right" as const,
    },
    { key: "customer", header: "Customer name" },
    { key: "portName", header: "Port name" },
    { key: "unloadingPlace", header: "Unloading place" },
    { key: "deliveryTerms", header: "Delivery terms" },
    { key: "transporter", header: "Transporter name" },
    {
      key: "freightPerTon",
      header: "Freight per ton",
      align: "right" as const,
    },
    {
      key: "freightAmount",
      header: "Freight amount",
      align: "right" as const,
    },
    { key: "biltyHardCopy", header: "Bilty hard copy" },
    { key: "invoiceHardCopy", header: "Invoice hard copy" },
    { key: "transportInvoiceNo", header: "Transport invoice no" },
    { key: "transportEntryInTally", header: "Transport in Tally" },
    ];
    if (variant === "update") {
      return [
        { key: "dispatchNumber", header: "Dispatch No" },
        ...base.map((column) => {
          const titleCaseHeaders: Record<string, string> = {
            date: "Date",
            saleInvoice: "Sale Invoice",
            lorryNumber: "Lorry Number",
            loadingWeight: "Loaded Qty",
            receivingWeight: "Unloaded Qty",
            diffInWeight: "Diff Qty",
            customer: "Customer Name",
            portName: "Loading Place",
            unloadingPlace: "Unloading Place",
            deliveryTerms: "Delivery Terms",
            transporter: "Transporter Name",
            freightPerTon: "Freight PMT",
            freightAmount: "Freight Amount",
            biltyHardCopy: "Bilty Hard Copy",
            invoiceHardCopy: "Invoice Hard Copy",
            transportInvoiceNo: "Transport Invoice No",
            transportEntryInTally: "Transport in Tally",
          };
          const header = titleCaseHeaders[column.key];
          return header ? { ...column, header } : column;
        }),
      ];
    }
    return base.filter((column) => column.key !== "unloadingPlace");
  }, [variant]);

  const exportRows = useMemo(
    () =>
      displayed.map((row) => {
        const base = {
          date: formatDateDdMmYyyy(row.dispatchDate),
        saleInvoice: row.saleInvoiceNumber ?? "—",
        lorryNumber: formatLorryNumber(row.lorryNumber) ?? "—",
        loadingWeight: formatDispatchMt(row.loadingWeight),
        receivingWeight: formatDispatchMt(row.receivingWeight),
        diffInWeight: formatDispatchMt(row.diffInWeight),
        customer: row.customerName
          ? (capitalizeName(row.customerName) ?? row.customerName)
          : "—",
        portName: row.portName ?? "—",
        unloadingPlace: row.customerCity
          ? (capitalizeName(row.customerCity) ?? row.customerCity)
          : "—",
        deliveryTerms: formatDispatchTerms(row.dispatchTerms),
        transporter: row.transporterName
          ? (capitalizeName(row.transporterName) ?? row.transporterName)
          : "—",
        freightPerTon:
          row.freightPerTon != null ? formatAmount(row.freightPerTon) : "—",
        freightAmount:
          row.freightAmount != null ? formatAmount(row.freightAmount) : "—",
        biltyHardCopy: formatChecklistYes(row.biltyHardCopy),
        invoiceHardCopy: formatChecklistYes(row.invoiceHardCopy),
        transportInvoiceNo: row.transportInvoiceNo?.trim() || "—",
        transportEntryInTally: formatChecklistYes(row.transportEntryInTally),
        };
        if (variant === "update") {
          return {
            dispatchNumber: displayDispatchNumber(row.dispatchNumber),
            ...base,
          };
        }
        return base;
      }),
    [displayed, variant],
  );

  const isUpdateLayout = variant === "update";
  const TableTag = isUpdateLayout ? UpdateTableInteraction : "table";

  return (
    <div>
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
          Delivery terms
          <select
            value={deliveryTermsFilter}
            onChange={(e) =>
              setDeliveryTermsFilter(e.target.value as "" | DispatchTerms)
            }
          >
            <option value="">All</option>
            <option value={DispatchTerms.FOR}>FOR</option>
            <option value={DispatchTerms.EX_PORT}>Ex-Port</option>
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
        <label>
          Date start
          <input
            type="date"
            lang="en-GB"
            className="field-input"
            value={dateStart}
            max={dateEnd || undefined}
            onChange={(e) => setDateStart(e.target.value)}
          />
        </label>
        <label>
          Date end
          <input
            type="date"
            lang="en-GB"
            className="field-input"
            value={dateEnd}
            min={dateStart || undefined}
            onChange={(e) => setDateEnd(e.target.value)}
          />
        </label>
        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setCustomerFilter("");
              setTransporterFilter("");
              setDeliveryTermsFilter(
                variant === "update" ? DispatchTerms.FOR : "",
              );
              setCompleteFilter("");
              setDateStart("");
              setDateEnd("");
            }}
          >
            Clear
          </button>
        )}
        <TableDownloadButtons
          title={exportTitle}
          filenameBase={exportFilenameBase}
          columns={exportColumns}
          rows={exportRows}
        />
      </form>

      <div
        className={
          isUpdateLayout
            ? "table-wrap table-wrap-scroll update-transport-table-wrap"
            : "table-wrap"
        }
      >
        <div className="table-h-scroll">
          <TableTag
            className={
              isUpdateLayout
                ? "data update-transport-table"
                : "data transport-engine-table"
            }
          >
            {isUpdateLayout ? (
              <colgroup>
                <col className="update-transport-col-dispatch" />
                <col className="update-transport-col-date" />
                <col className="update-transport-col-invoice" />
                <col className="update-transport-col-lorry" />
                <col className="update-transport-col-qty" />
                <col className="update-transport-col-qty" />
                <col className="update-transport-col-qty" />
                <col className="update-transport-col-name" />
                <col className="update-transport-col-port" />
                <col className="update-transport-col-place" />
                <col className="update-transport-col-terms" />
                <col className="update-transport-col-transporter" />
                <col className="update-transport-col-amt" />
                <col className="update-transport-col-amt" />
                <col className="update-transport-col-check" />
                <col className="update-transport-col-check" />
                <col className="update-transport-col-invoice-no" />
                <col className="update-transport-col-tally" />
                <col className="update-transport-col-actions" />
              </colgroup>
            ) : null}
          <thead>
            <tr>
              {isUpdateLayout ? (
                <th className="update-transport-dispatch-col">
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("dispatchNumber")}
                  >
                    Dispatch No
                    {sortIndicator(sortKey === "dispatchNumber", sortDir)}
                  </button>
                </th>
              ) : null}
              <th className={isUpdateLayout ? "update-transport-date-col" : undefined}>
                {isUpdateLayout ? (
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("date")}
                  >
                    Date
                    {sortIndicator(sortKey === "date", sortDir)}
                  </button>
                ) : (
                  "Date"
                )}
              </th>
              <th>{isUpdateLayout ? "Sale Invoice" : "Sale invoice"}</th>
              <th>{isUpdateLayout ? "Lorry Number" : "Lorry number"}</th>
              <th className="cell-num">
                {isUpdateLayout ? "Loaded Qty" : "Loading weight"}
              </th>
              <th className="cell-num">
                {isUpdateLayout ? "Unloaded Qty" : "Receiving weight"}
              </th>
              <th className="cell-num">
                {isUpdateLayout ? (
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("diffInWeight")}
                  >
                    Diff Qty
                    {sortIndicator(sortKey === "diffInWeight", sortDir)}
                  </button>
                ) : (
                  "Diff in weight"
                )}
              </th>
              <th className={isUpdateLayout ? undefined : "report-customer-col"}>
                {isUpdateLayout ? "Customer Name" : "Customer name"}
              </th>
              <th>{isUpdateLayout ? "Loading Place" : "Port name"}</th>
              {isUpdateLayout ? <th>Unloading Place</th> : null}
              <th>
                {isUpdateLayout ? (
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("deliveryTerms")}
                  >
                    Delivery Terms
                    {sortIndicator(sortKey === "deliveryTerms", sortDir)}
                  </button>
                ) : (
                  "Delivery terms"
                )}
              </th>
              <th>
                {isUpdateLayout ? (
                  <button
                    type="button"
                    className="th-sort"
                    onClick={() => toggleSort("transporterName")}
                  >
                    Transporter Name
                    {sortIndicator(sortKey === "transporterName", sortDir)}
                  </button>
                ) : (
                  "Transporter name"
                )}
              </th>
              <th className="cell-num">
                {isUpdateLayout ? "Freight PMT" : "Freight per ton"}
              </th>
              <th className="cell-num">
                {isUpdateLayout ? "Freight Amount" : "Freight amount"}
              </th>
              <th className="cell-center">
                {isUpdateLayout ? "Bilty Hard Copy" : "Bilty hard copy"}
              </th>
              <th className="cell-center">
                {isUpdateLayout ? "Invoice Hard Copy" : "Invoice hard copy"}
              </th>
              <th>
                {isUpdateLayout ? "Transport Invoice No" : "Transport invoice no"}
              </th>
              <th className="cell-center">Transport in Tally</th>
              <th className={isUpdateLayout ? "update-transport-actions-col" : undefined}>
                {isUpdateLayout ? null : "Edit"}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => {
              const lorry = formatLorryNumber(row.lorryNumber);
              return (
                <tr key={row.id} data-dispatch-id={row.id}>
                  {isUpdateLayout ? (
                    <td className="update-transport-dispatch-col">
                      {displayDispatchNumber(row.dispatchNumber)}
                    </td>
                  ) : null}
                  <td
                    className={
                      isUpdateLayout ? "update-transport-date-col" : undefined
                    }
                  >
                    {formatDateDdMmYyyy(row.dispatchDate)}
                  </td>
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
                  <td
                    className={
                      row.customerName
                        ? isUpdateLayout
                          ? "update-transport-name-cell"
                          : "report-customer-col"
                        : isUpdateLayout
                          ? "update-transport-name-cell cell-center"
                          : "report-customer-col cell-center"
                    }
                    title={row.customerName ?? undefined}
                  >
                    {row.customerName
                      ? (capitalizeName(row.customerName) ?? row.customerName)
                      : "—"}
                  </td>
                  <td className={row.portName ? undefined : "cell-center"}>
                    {row.portName ?? "—"}
                  </td>
                  {isUpdateLayout ? (
                    <td
                      className={
                        row.customerCity
                          ? "update-transport-name-cell"
                          : "update-transport-name-cell cell-center"
                      }
                      title={row.customerCity ?? undefined}
                    >
                      {row.customerCity
                        ? (capitalizeName(row.customerCity) ?? row.customerCity)
                        : "—"}
                    </td>
                  ) : null}
                  <td>
                    {formatDispatchTerms(row.dispatchTerms)}
                  </td>
                  <td
                    className={
                      row.transporterName
                        ? isUpdateLayout
                          ? "update-transport-transporter-cell"
                          : undefined
                        : "cell-center"
                    }
                    title={row.transporterName ?? undefined}
                  >
                    {row.transporterName
                      ? (capitalizeName(row.transporterName) ??
                        row.transporterName)
                      : "—"}
                  </td>
                  <td className="cell-num">
                    {row.freightPerTon != null
                      ? formatAmount(row.freightPerTon)
                      : "—"}
                  </td>
                  <td className="cell-num">
                    {row.freightAmount != null
                      ? formatAmount(row.freightAmount)
                      : "—"}
                  </td>
                  <td className="cell-center">
                    {formatChecklistYes(row.biltyHardCopy)}
                  </td>
                  <td className="cell-center">
                    {formatChecklistYes(row.invoiceHardCopy)}
                  </td>
                  <td
                    className={
                      row.transportInvoiceNo?.trim()
                        ? undefined
                        : "cell-center"
                    }
                  >
                    {row.transportInvoiceNo?.trim() || "—"}
                  </td>
                  <td className="cell-center">
                    {formatChecklistYes(row.transportEntryInTally)}
                  </td>
                  <td className={isUpdateLayout ? "update-transport-actions-col" : undefined}>
                    <div className="dispatch-edit-actions">
                      {isUpdateLayout ? (
                        <>
                          <EditTransportChecklistButton
                            dispatchId={row.id}
                            mode="bilty"
                            biltyHardCopy={row.biltyHardCopy}
                            transportInvoiceNo={row.transportInvoiceNo}
                            invoiceHardCopy={row.invoiceHardCopy}
                            softCopyStatus={row.softCopyStatus}
                            transportEntryInTally={row.transportEntryInTally}
                            canEdit={row.canEdit}
                            buttonLabel="Bilty Edit"
                            rowSummary={buildTransportEditRowSummary(row)}
                            onUpdated={(result) => {
                              setRows((prev) =>
                                prev.map((item) =>
                                  item.id === row.id
                                    ? {
                                        ...item,
                                        biltyHardCopy: result.biltyHardCopy,
                                        transportInvoiceNo:
                                          result.transportInvoiceNo,
                                        invoiceHardCopy: result.invoiceHardCopy,
                                        softCopyStatus: result.softCopyStatus,
                                        transportEntryInTally:
                                          result.transportEntryInTally,
                                      }
                                    : item,
                                ),
                              );
                            }}
                          />
                          <EditTransportChecklistButton
                            dispatchId={row.id}
                            mode="invoice"
                            biltyHardCopy={row.biltyHardCopy}
                            transportInvoiceNo={row.transportInvoiceNo}
                            invoiceHardCopy={row.invoiceHardCopy}
                            softCopyStatus={row.softCopyStatus}
                            transportEntryInTally={row.transportEntryInTally}
                            canEdit={row.canEdit}
                            buttonLabel="Invoice Edit"
                            rowSummary={buildTransportEditRowSummary(row)}
                            onUpdated={(result) => {
                              setRows((prev) =>
                                prev.map((item) =>
                                  item.id === row.id
                                    ? {
                                        ...item,
                                        biltyHardCopy: result.biltyHardCopy,
                                        transportInvoiceNo:
                                          result.transportInvoiceNo,
                                        invoiceHardCopy: result.invoiceHardCopy,
                                        softCopyStatus: result.softCopyStatus,
                                        transportEntryInTally:
                                          result.transportEntryInTally,
                                      }
                                    : item,
                                ),
                              );
                            }}
                          />
                        </>
                      ) : (
                        <EditTransportChecklistButton
                          dispatchId={row.id}
                          biltyHardCopy={row.biltyHardCopy}
                          transportInvoiceNo={row.transportInvoiceNo}
                          invoiceHardCopy={row.invoiceHardCopy}
                          softCopyStatus={row.softCopyStatus}
                          transportEntryInTally={row.transportEntryInTally}
                          canEdit={row.canEdit}
                          buttonLabel="Edit"
                          onUpdated={(result) => {
                            setRows((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? {
                                      ...item,
                                      biltyHardCopy: result.biltyHardCopy,
                                      transportInvoiceNo:
                                        result.transportInvoiceNo,
                                      invoiceHardCopy: result.invoiceHardCopy,
                                      softCopyStatus: result.softCopyStatus,
                                      transportEntryInTally:
                                        result.transportEntryInTally,
                                    }
                                  : item,
                              ),
                            );
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayed.length === 0 && (
              <tr>
                <td colSpan={isUpdateLayout ? 19 : 17}>
                  {rows.length === 0
                    ? "No dispatches yet."
                    : "No dispatches match these filters."}
                </td>
              </tr>
            )}
          </tbody>
          </TableTag>
        </div>
      </div>
    </div>
  );
}
