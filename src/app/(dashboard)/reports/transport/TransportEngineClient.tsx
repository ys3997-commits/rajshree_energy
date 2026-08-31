"use client";

import { useMemo, useState } from "react";
import { DispatchTerms } from "@/generated/prisma";
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
import { displayDispatchNumber } from "@/lib/domain/dispatchNumbers";
import { isTransportChecklistComplete } from "@/lib/domain/dispatchChecklist";

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
            loadingWeight: "Loading Weight",
            receivingWeight: "Receiving Weight",
            diffInWeight: "Diff in Weight",
            customer: "Customer Name",
            portName: "Port Name",
            deliveryTerms: "Delivery Terms",
            transporter: "Transporter Name",
            freightPerTon: "Freight per Ton",
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
    return base;
  }, [variant]);

  const exportRows = useMemo(
    () =>
      filtered.map((row) => {
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
    [filtered, variant],
  );

  const isUpdateLayout = variant === "update";

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
          <table
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
              {isUpdateLayout ? <th>Dispatch No</th> : null}
              <th>Date</th>
              <th>{isUpdateLayout ? "Sale Invoice" : "Sale invoice"}</th>
              <th>{isUpdateLayout ? "Lorry Number" : "Lorry number"}</th>
              <th className="cell-num">
                {isUpdateLayout ? "Loading Weight" : "Loading weight"}
              </th>
              <th className="cell-num">
                {isUpdateLayout ? "Receiving Weight" : "Receiving weight"}
              </th>
              <th className="cell-num">
                {isUpdateLayout ? "Diff in Weight" : "Diff in weight"}
              </th>
              <th className={isUpdateLayout ? undefined : "report-customer-col"}>
                {isUpdateLayout ? "Customer Name" : "Customer name"}
              </th>
              <th>{isUpdateLayout ? "Port Name" : "Port name"}</th>
              <th>{isUpdateLayout ? "Delivery Terms" : "Delivery terms"}</th>
              <th>{isUpdateLayout ? "Transporter Name" : "Transporter name"}</th>
              <th className="cell-num">
                {isUpdateLayout ? "Freight per Ton" : "Freight per ton"}
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
            {filtered.map((row) => {
              const lorry = formatLorryNumber(row.lorryNumber);
              return (
                <tr key={row.id}>
                  {isUpdateLayout ? (
                    <td>{displayDispatchNumber(row.dispatchNumber)}</td>
                  ) : null}
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
                      <EditTransportChecklistButton
                        dispatchId={row.id}
                        biltyHardCopy={row.biltyHardCopy}
                        transportInvoiceNo={row.transportInvoiceNo}
                        invoiceHardCopy={row.invoiceHardCopy}
                        softCopyStatus={row.softCopyStatus}
                        transportEntryInTally={row.transportEntryInTally}
                        canEdit={row.canEdit}
                        buttonLabel={
                          isUpdateLayout ? "Transport edit" : "Edit"
                        }
                        rowSummary={
                          isUpdateLayout
                            ? buildTransportEditRowSummary(row)
                            : undefined
                        }
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
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isUpdateLayout ? 18 : 17}>
                  {rows.length === 0
                    ? "No dispatches yet."
                    : "No dispatches match these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
