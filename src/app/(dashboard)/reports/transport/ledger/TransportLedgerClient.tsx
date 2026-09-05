"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type {
  TransportLedgerRow,
  TransportLedgerTransporterOption,
} from "@/lib/actions/transportLedger";
import {
  capitalizeName,
  formatDispatchMt,
  formatLorryNumber,
  formatAmount,
} from "@/lib/domain/format";

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** Export cells: blank when empty (no em dash). */
function exportBlank(value: string | null | undefined): string {
  if (value == null || value === "" || value === "—") return "";
  return value;
}

function formatRate(value: string | null): string {
  if (value == null || value === "") return "—";
  return formatAmount(value);
}

function exportDate(value: string | null | undefined): string {
  if (!value) return "";
  return exportBlank(formatDateDdMmYyyy(value));
}

function exportRate(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatAmount(value));
}

function exportWeight(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatDispatchMt(value));
}

function exportRsAmount(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatAmount(value));
}

/** Fund paid and discount paid display as "- Rs …". */
function formatFundAmount(
  fundType: TransportLedgerRow["fundType"],
  amount: string | null,
): string {
  if (amount == null) return "—";
  const formatted = formatAmount(amount);
  if (fundType === "Fund paid" || fundType === "Discount paid") {
    return `- ${formatted}`;
  }
  return formatted;
}

function exportFundAmount(
  fundType: TransportLedgerRow["fundType"],
  amount: string | null,
): string {
  if (amount == null) return "";
  return exportBlank(formatFundAmount(fundType, amount));
}

function toAmount(value: string | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function TransportLedgerClient({
  transporters,
  transporterId,
  dateFrom,
  dateTo,
  rows,
  openingDue,
  due,
  dueAfterTds,
}: {
  transporters: TransportLedgerTransporterOption[];
  transporterId: string;
  dateFrom: string;
  dateTo: string;
  rows: TransportLedgerRow[];
  openingDue: string | null;
  due: string | null;
  dueAfterTds: string | null;
}) {
  const router = useRouter();

  const selectedTransporter = useMemo(
    () => transporters.find((t) => t.id === transporterId) ?? null,
    [transporters, transporterId],
  );

  const dispatchRows = useMemo(
    () => rows.filter((row) => row.date != null),
    [rows],
  );
  const fundRows = useMemo(
    () => rows.filter((row) => row.fundDate != null),
    [rows],
  );

  const freightTotal = useMemo(
    () =>
      dispatchRows.reduce((sum, row) => sum + toAmount(row.freightAmount), 0),
    [dispatchRows],
  );

  const quantityTotal = useMemo(
    () => dispatchRows.reduce((sum, row) => sum + toAmount(row.weight), 0),
    [dispatchRows],
  );

  const fundTotal = useMemo(
    () =>
      fundRows.reduce((sum, row) => {
        const amount = toAmount(row.fundAmount);
        if (row.fundType === "Fund paid" || row.fundType === "Discount paid") {
          return sum - amount;
        }
        if (
          row.fundType === "Fund received" ||
          row.fundType === "Discount received"
        ) {
          return sum + amount;
        }
        return sum;
      }, 0),
    [fundRows],
  );

  const transporterLabel = selectedTransporter
    ? (capitalizeName(selectedTransporter.name) ?? selectedTransporter.name)
    : "Transporter";

  const DIVIDER = "     |     ";

  const exportColumns = useMemo(
    () => [
      { key: "date", header: "Date" },
      { key: "lorryNumber", header: "Lorry No" },
      { key: "weight", header: "Weight", align: "right" as const },
      { key: "freightPerMt", header: "Freight PMT", align: "right" as const },
      {
        key: "freightAmount",
        header: "Freight Amount",
        align: "right" as const,
      },
      {
        key: "freightAmountAfterTds",
        header: "Freight Amount after TDS",
        align: "right" as const,
      },
      { key: "customer", header: "Customer" },
      { key: "port", header: "Port" },
      {
        key: "divider",
        header: DIVIDER,
        align: "center" as const,
        divider: true,
      },
      { key: "fundDate", header: "Date" },
      { key: "particular", header: "Particular" },
      { key: "amount", header: "Amount", align: "right" as const },
    ],
    [],
  );

  const exportRows = useMemo(() => {
    const len = Math.max(dispatchRows.length, fundRows.length);
    const next: Array<Record<string, string>> = [];

    for (let i = 0; i < len; i++) {
      const dispatch = dispatchRows[i];
      const fund = fundRows[i];
      next.push({
        date: dispatch ? exportDate(dispatch.date) : "",
        lorryNumber: dispatch?.lorryNumber?.trim()
          ? (formatLorryNumber(dispatch.lorryNumber) ?? dispatch.lorryNumber)
          : "",
        weight: dispatch ? exportWeight(dispatch.weight) : "",
        freightPerMt: dispatch ? exportRate(dispatch.freightPerMt) : "",
        freightAmount: dispatch ? exportRsAmount(dispatch.freightAmount) : "",
        freightAmountAfterTds: dispatch
          ? exportRsAmount(dispatch.freightAmountAfterTds)
          : "",
        customer: dispatch?.customerName
          ? (capitalizeName(dispatch.customerName) ?? dispatch.customerName)
          : "",
        port: dispatch?.portName ?? "",
        divider: DIVIDER,
        fundDate: fund ? exportDate(fund.fundDate) : "",
        particular: fund?.fundType ?? "",
        amount: fund
          ? exportFundAmount(fund.fundType, fund.fundAmount)
          : "",
      });
    }

    return next;
  }, [dispatchRows, fundRows]);

  const dateRangeLabel = useMemo(() => {
    if (dateFrom && dateTo) {
      return `${formatDateDdMmYyyy(dateFrom)} – ${formatDateDdMmYyyy(dateTo)}`;
    }
    if (dateFrom) return `from ${formatDateDdMmYyyy(dateFrom)}`;
    if (dateTo) return `to ${formatDateDdMmYyyy(dateTo)}`;
    return "";
  }, [dateFrom, dateTo]);

  const filenameBase = useMemo(() => {
    const slug = transporterLabel
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return slug ? `ledger-${slug}` : "ledger";
  }, [transporterLabel]);

  function ledgerHref(next: {
    transporterId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const params = new URLSearchParams();
    const id = next.transporterId ?? transporterId;
    const from = next.dateFrom ?? dateFrom;
    const to = next.dateTo ?? dateTo;
    if (id) params.set("transporterId", id);
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    const qs = params.toString();
    return qs
      ? `/reports/transport/ledger?${qs}`
      : "/reports/transport/ledger";
  }

  function onTransporterChange(nextId: string) {
    router.push(ledgerHref({ transporterId: nextId }));
  }

  function onDateFromChange(next: string) {
    router.push(ledgerHref({ dateFrom: next }));
  }

  function onDateToChange(next: string) {
    router.push(ledgerHref({ dateTo: next }));
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Transport
            <span aria-hidden="true"> · </span>
            Ledger
          </p>
          <h1 className="page-title">Ledger</h1>
          <p className="page-subtitle">
            Transporter ledger of dispatches, funds, and discounts.
          </p>
        </div>
        {transporterId ? (
          <div className="detail-stat-row">
            <div className="detail-stat">
              <span className="detail-stat-label">Total quantity</span>
              <span className="detail-stat-value">
                {formatDispatchMt(quantityTotal)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Opening balance</span>
              <span className="detail-stat-value">
                {formatAmount(openingDue)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Freight</span>
              <span className="detail-stat-value">
                {formatAmount(freightTotal)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Fund</span>
              <span className="detail-stat-value">{formatAmount(fundTotal)}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Current due</span>
              <span className="detail-stat-value">{formatAmount(due)}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Due after TDS</span>
              <span className="detail-stat-value">
                {formatAmount(dueAfterTds)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Transporter name
          <select
            value={transporterId}
            onChange={(e) => onTransporterChange(e.target.value)}
            aria-label="Transporter name"
          >
            <option value="">Select transporter</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>
                {capitalizeName(t.name) ?? t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            max={dateTo || undefined}
            aria-label="Start date"
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            min={dateFrom || undefined}
            aria-label="End date"
          />
        </label>
        {transporterId ? (
          <TableDownloadButtons
            title={`Ledger — ${transporterLabel}${dateRangeLabel ? ` · ${dateRangeLabel}` : ""} · Total quantity ${formatDispatchMt(quantityTotal)} · Opening balance ${formatAmount(openingDue)} · Freight ${formatAmount(freightTotal)} · Fund ${formatAmount(fundTotal)} · Current due ${formatAmount(due)} · Due after TDS ${formatAmount(dueAfterTds)}`}
            filenameBase={filenameBase}
            columns={exportColumns}
            rows={exportRows}
          />
        ) : null}
      </form>

      {!transporterId ? (
        <p className="page-subtitle">
          Select a transporter to view the ledger.
        </p>
      ) : (
        <div className="ledger-panels ledger-panels-transport">
          <section className="ledger-panel ledger-panel-dispatch">
            <h2 className="ledger-panel-title">Dispatch</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <div className="table-h-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>
                        <span className="ledger-th-inner">Date</span>
                      </th>
                      <th>
                        <span className="ledger-th-inner">Lorry No</span>
                      </th>
                      <th className="cell-num">
                        <span className="ledger-th-inner">Weight</span>
                      </th>
                      <th className="cell-num">
                        <span className="ledger-th-inner">Freight PMT</span>
                      </th>
                      <th className="cell-num">
                        <span className="ledger-th-inner">Freight Amount</span>
                      </th>
                      <th className="cell-num">
                        <span className="ledger-th-inner">
                          <span>
                            Freight Amount
                            <br />
                            after TDS
                          </span>
                        </span>
                      </th>
                      <th>
                        <span className="ledger-th-inner">Customer</span>
                      </th>
                      <th>
                        <span className="ledger-th-inner">Port</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dispatchRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateDdMmYyyy(row.date)}</td>
                        <td>
                          {row.lorryNumber?.trim()
                            ? (formatLorryNumber(row.lorryNumber) ??
                              row.lorryNumber)
                            : "—"}
                        </td>
                        <td className="cell-num">
                          {row.weight != null
                            ? formatDispatchMt(row.weight)
                            : "—"}
                        </td>
                        <td className="cell-num">
                          {formatRate(row.freightPerMt)}
                        </td>
                        <td className="cell-num">
                          {row.freightAmount != null
                            ? formatAmount(row.freightAmount)
                            : "—"}
                        </td>
                        <td className="cell-num">
                          {row.freightAmountAfterTds != null
                            ? formatAmount(row.freightAmountAfterTds)
                            : "—"}
                        </td>
                        <td>
                          {row.customerName
                            ? (capitalizeName(row.customerName) ??
                              row.customerName)
                            : "—"}
                        </td>
                        <td>{row.portName ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="ledger-panel ledger-panel-funds">
            <h2 className="ledger-panel-title">Funds &amp; Discounts</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <div className="table-h-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>
                        <span className="ledger-th-inner">Date</span>
                      </th>
                      <th>
                        <span className="ledger-th-inner">Particular</span>
                      </th>
                      <th className="cell-num">
                        <span className="ledger-th-inner">Amount</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateDdMmYyyy(row.fundDate)}</td>
                        <td>{row.fundType ?? "—"}</td>
                        <td className="cell-num">
                          {formatFundAmount(row.fundType, row.fundAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
