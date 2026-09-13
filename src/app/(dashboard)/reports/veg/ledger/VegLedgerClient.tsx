"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type {
  VegLedgerCustomerOption,
  VegLedgerFundRow,
  VegLedgerSupplyRow,
  VegLedgerVegOption,
} from "@/lib/actions/vegLedger";
import {
  capitalizeName,
  formatAmount,
  formatDispatchMt,
} from "@/lib/domain/format";
import { paymentBasisLabel } from "@/lib/domain/vegLedger";
import { vegLedgerHref } from "../vegHref";

function formatDateDdMmYyyy(value: string | null | undefined): string {
  if (!value) return "—";
  const datePart = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

function exportBlank(value: string | null | undefined): string {
  if (value == null || value === "" || value === "—") return "";
  return value;
}

function formatFundAmount(
  fundType: VegLedgerFundRow["fundType"],
  amount: string | null,
): string {
  if (amount == null) return "—";
  const formatted = formatAmount(amount);
  if (fundType === "Fund paid" || fundType === "Discount paid") {
    return `- ${formatted}`;
  }
  return formatted;
}

export function VegLedgerClient({
  customers,
  customerId,
  vegs,
  vegId,
  dateFrom,
  dateTo,
  supplyRows,
  fundRows,
  openingDue,
  quantity,
  trucks,
  payable,
  netPayable,
  fundPaid,
}: {
  customers: VegLedgerCustomerOption[];
  customerId: string;
  vegs: VegLedgerVegOption[];
  vegId: string;
  dateFrom: string;
  dateTo: string;
  supplyRows: VegLedgerSupplyRow[];
  fundRows: VegLedgerFundRow[];
  openingDue: string | null;
  quantity: string | null;
  trucks: number | null;
  payable: string | null;
  netPayable: string | null;
  fundPaid: string | null;
}) {
  const router = useRouter();
  const showLedger = Boolean(customerId && vegId);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  );

  const customerLabel = selectedCustomer
    ? (capitalizeName(selectedCustomer.name) ?? selectedCustomer.name)
    : "Customer";

  const dateRangeLabel = useMemo(() => {
    if (dateFrom && dateTo) {
      return `${formatDateDdMmYyyy(dateFrom)} – ${formatDateDdMmYyyy(dateTo)}`;
    }
    if (dateFrom) return `from ${formatDateDdMmYyyy(dateFrom)}`;
    if (dateTo) return `upto ${formatDateDdMmYyyy(dateTo)}`;
    return "";
  }, [dateFrom, dateTo]);

  const filenameBase = useMemo(() => {
    const slug = customerLabel
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return slug ? `veg-ledger-${slug}` : "veg-ledger";
  }, [customerLabel]);

  const DIVIDER = "     |     ";

  const exportColumns = [
    { key: "month", header: "Month" },
    { key: "customer", header: "Customer" },
    { key: "vegName", header: "Veg name" },
    { key: "qty", header: "Qty", align: "right" as const },
    { key: "trucks", header: "No of trucks", align: "right" as const },
    { key: "rate", header: "Veg rate", align: "right" as const },
    { key: "payment", header: "Payment" },
    { key: "payable", header: "Payable", align: "right" as const },
    {
      key: "divider",
      header: DIVIDER,
      align: "center" as const,
      divider: true,
    },
    { key: "fundDate", header: "Date" },
    { key: "particular", header: "Particular" },
    { key: "amount", header: "Amount", align: "right" as const },
  ];

  const exportRows = useMemo(() => {
    const len = Math.max(supplyRows.length, fundRows.length);
    const next: Array<Record<string, string>> = [];
    for (let i = 0; i < len; i++) {
      const supply = supplyRows[i];
      const fund = fundRows[i];
      next.push({
        month: supply?.monthLabel ?? "",
        customer: supply
          ? (capitalizeName(supply.customerName) ?? supply.customerName)
          : "",
        vegName: supply
          ? (capitalizeName(supply.vegName) ?? supply.vegName)
          : "",
        qty: supply ? exportBlank(formatDispatchMt(supply.quantity)) : "",
        trucks: supply ? String(supply.trucks) : "",
        rate: supply ? exportBlank(formatAmount(supply.vegRate)) : "",
        payment: supply ? paymentBasisLabel(supply.paymentBasis) : "",
        payable: supply ? exportBlank(formatAmount(supply.payable)) : "",
        divider: DIVIDER,
        fundDate: fund ? exportBlank(formatDateDdMmYyyy(fund.date)) : "",
        particular: fund?.fundType ?? "",
        amount: fund
          ? exportBlank(formatFundAmount(fund.fundType, fund.amount))
          : "",
      });
    }
    return next;
  }, [supplyRows, fundRows]);

  function onCustomerChange(nextId: string) {
    router.push(
      vegLedgerHref({
        customerId: nextId,
        dateFrom,
        dateTo,
      }),
    );
  }

  function onVegChange(nextId: string) {
    router.push(
      vegLedgerHref({
        customerId,
        vegId: nextId,
        dateFrom,
        dateTo,
      }),
    );
  }

  function onDateFromChange(next: string) {
    router.push(
      vegLedgerHref({
        customerId,
        vegId,
        dateFrom: next,
        dateTo,
      }),
    );
  }

  function onDateToChange(next: string) {
    router.push(
      vegLedgerHref({
        customerId,
        vegId,
        dateFrom,
        dateTo: next,
      }),
    );
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Veg
            <span aria-hidden="true"> · </span>
            Veg Ledger
          </p>
          <h1 className="page-title">Veg Ledger</h1>
        </div>
        {showLedger ? (
          <div className="detail-stat-row veg-ledger-stats">
            <div className="detail-stat">
              <span className="detail-stat-label">Total quantity</span>
              <span className="detail-stat-value">
                {formatDispatchMt(quantity)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">No of trucks</span>
              <span className="detail-stat-value">{trucks ?? 0}</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Payable</span>
              <span className="detail-stat-value">
                {formatAmount(payable)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Fund paid</span>
              <span className="detail-stat-value">
                {formatAmount(fundPaid)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Opening</span>
              <span className="detail-stat-value">
                {formatAmount(openingDue)}
              </span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-label">Net payable</span>
              <span className="detail-stat-value">
                {formatAmount(netPayable)}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <form className="filters veg-ledger-filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Customer name
          <select
            value={customerId}
            onChange={(e) => onCustomerChange(e.target.value)}
            aria-label="Customer name"
          >
            <option value="">Select industry customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {capitalizeName(c.name) ?? c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Veg name
          <select
            value={vegId}
            onChange={(e) => onVegChange(e.target.value)}
            aria-label="Veg name"
            disabled={!customerId}
          >
            <option value="">Select veg</option>
            {vegs.map((veg) => (
              <option key={veg.id} value={veg.id}>
                {capitalizeName(veg.name) ?? veg.name}
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
        {showLedger ? (
          <TableDownloadButtons
            title={`Veg Ledger — ${customerLabel}${dateRangeLabel ? ` · ${dateRangeLabel}` : ""}`}
            filenameBase={filenameBase}
            columns={exportColumns}
            rows={exportRows}
          />
        ) : null}
      </form>

      {showLedger ? (
        <div className="ledger-panels ledger-panels-veg">
          <section className="ledger-panel ledger-panel-dispatch">
            <h2 className="ledger-panel-title">Monthly supply</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <div className="table-h-scroll">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Customer</th>
                      <th>Veg name</th>
                      <th className="cell-num">Qty</th>
                      <th className="cell-num">No of trucks</th>
                      <th className="cell-num">Veg rate</th>
                      <th>Payment</th>
                      <th className="cell-num">Payable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplyRows.map((row, index) => {
                      const monthStart =
                        index === 0 ||
                        supplyRows[index - 1].monthKey !== row.monthKey;
                      return (
                        <tr
                          key={row.id}
                          className={monthStart ? "veg-ledger-month-start" : undefined}
                        >
                          <td>{row.monthLabel}</td>
                          <td>
                            {capitalizeName(row.customerName) ??
                              row.customerName}
                          </td>
                          <td>
                            {capitalizeName(row.vegName) ?? row.vegName}
                          </td>
                          <td className="cell-num">
                            {formatDispatchMt(row.quantity)}
                          </td>
                          <td className="cell-num">{row.trucks}</td>
                          <td className="cell-num">
                            {formatAmount(row.vegRate)}
                          </td>
                          <td>{paymentBasisLabel(row.paymentBasis)}</td>
                          <td className="cell-num">
                            {formatAmount(row.payable)}
                          </td>
                        </tr>
                      );
                    })}
                    {supplyRows.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          No industry supply in this date range.
                        </td>
                      </tr>
                    )}
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
                      <th>Date</th>
                      <th>Particular</th>
                      <th className="cell-num">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundRows.map((row) => (
                      <tr key={row.id}>
                        <td>{formatDateDdMmYyyy(row.date)}</td>
                        <td>{row.fundType}</td>
                        <td className="cell-num">
                          {formatFundAmount(row.fundType, row.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
