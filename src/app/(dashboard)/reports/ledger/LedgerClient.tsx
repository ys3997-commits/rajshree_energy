"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { LedgerCustomerOption, LedgerRow } from "@/lib/actions/ledger";
import {
  capitalizeName,
  formatCustomerCategory,
  formatDispatchMt,
  formatRs,
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
  return formatRs(value);
}

function exportDate(value: string | null | undefined): string {
  if (!value) return "";
  return exportBlank(formatDateDdMmYyyy(value));
}

function exportRate(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatRs(value));
}

function exportWeight(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatDispatchMt(value));
}

function exportRsAmount(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return exportBlank(formatRs(value));
}

/** Fund paid and discount received display as "- Rs …". */
function formatFundAmount(
  fundType: LedgerRow["fundType"],
  amount: string | null,
): string {
  if (amount == null) return "—";
  const formatted = formatRs(amount);
  if (fundType === "Fund paid" || fundType === "Discount received") {
    return `- ${formatted}`;
  }
  return formatted;
}

function exportFundAmount(
  fundType: LedgerRow["fundType"],
  amount: string | null,
): string {
  if (amount == null) return "";
  return exportBlank(formatFundAmount(fundType, amount));
}

export function LedgerClient({
  customers,
  customerId,
  rows,
}: {
  customers: LedgerCustomerOption[];
  customerId: string;
  rows: LedgerRow[];
}) {
  const router = useRouter();

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId) ?? null,
    [customers, customerId],
  );

  const dispatchRows = useMemo(
    () => rows.filter((row) => row.date != null),
    [rows],
  );
  const fundRows = useMemo(
    () => rows.filter((row) => row.fundDate != null),
    [rows],
  );

  const showTcs = useMemo(
    () =>
      dispatchRows.some(
        (row) => row.tcs != null && String(row.tcs).trim() !== "",
      ),
    [dispatchRows],
  );

  const customerLabel = selectedCustomer
    ? (capitalizeName(selectedCustomer.name) ?? selectedCustomer.name)
    : "Customer";

  const DIVIDER = "     |     ";

  const exportColumns = useMemo(() => {
    const columns = [
      { key: "date", header: "Date" },
      { key: "type", header: "Type" },
      { key: "lorryNumber", header: "Lorry No" },
      { key: "weight", header: "Weight", align: "right" as const },
      { key: "basicRate", header: "Basic Rate", align: "right" as const },
      { key: "gst", header: "GST", align: "right" as const },
      ...(showTcs
        ? [{ key: "tcs", header: "TCS", align: "right" as const }]
        : []),
      { key: "finalAmount", header: "Final Amount", align: "right" as const },
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
    return columns;
  }, [showTcs]);

  const exportRows = useMemo(() => {
    const len = Math.max(dispatchRows.length, fundRows.length);
    const next: Array<Record<string, string>> = [];

    for (let i = 0; i < len; i++) {
      const dispatch = dispatchRows[i];
      const fund = fundRows[i];
      const row: Record<string, string> = {
        date: dispatch ? exportDate(dispatch.date) : "",
        type: dispatch?.dispatchType ?? "",
        lorryNumber: dispatch?.lorryNumber?.trim()
          ? dispatch.lorryNumber
          : "",
        weight: dispatch ? exportWeight(dispatch.weight) : "",
        basicRate: dispatch ? exportRate(dispatch.basicRate) : "",
        gst: dispatch ? exportRate(dispatch.gst) : "",
        finalAmount: dispatch ? exportRsAmount(dispatch.finalAmount) : "",
        divider: DIVIDER,
        fundDate: fund ? exportDate(fund.fundDate) : "",
        particular: fund?.fundType ?? "",
        amount: fund
          ? exportFundAmount(fund.fundType, fund.fundAmount)
          : "",
      };
      if (showTcs) {
        row.tcs = dispatch ? exportRate(dispatch.tcs) : "";
      }
      next.push(row);
    }

    return next;
  }, [dispatchRows, fundRows, showTcs]);

  const filenameBase = useMemo(() => {
    const slug = customerLabel
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    return slug ? `ledger-${slug}` : "ledger";
  }, [customerLabel]);

  function onCustomerChange(nextId: string) {
    if (!nextId) {
      router.push("/reports/ledger");
      return;
    }
    router.push(`/reports/ledger?customerId=${encodeURIComponent(nextId)}`);
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Customer
            <span aria-hidden="true"> · </span>
            Ledger
          </p>
          <h1 className="page-title">Ledger</h1>
          <p className="page-subtitle">
            Customer ledger of dispatches, funds, and discounts.
          </p>
        </div>
      </div>

      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>
          Customer name
          <select
            value={customerId}
            onChange={(e) => onCustomerChange(e.target.value)}
            aria-label="Customer name"
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {(capitalizeName(c.name) ?? c.name) +
                  ` — ${formatCustomerCategory(c.category)}`}
              </option>
            ))}
          </select>
        </label>
        {customerId ? (
          <TableDownloadButtons
            title={`Ledger — ${customerLabel}`}
            filenameBase={filenameBase}
            columns={exportColumns}
            rows={exportRows}
          />
        ) : null}
      </form>

      {!customerId ? (
        <p className="page-subtitle">Select a customer to view the ledger.</p>
      ) : (
        <div className="ledger-panels">
          <section className="ledger-panel ledger-panel-dispatch">
            <h2 className="ledger-panel-title">Dispatch</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <table className="data payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Lorry No</th>
                    <th className="cell-num">Weight</th>
                    <th className="cell-num">Basic Rate</th>
                    <th className="cell-num">GST</th>
                    {showTcs ? <th className="cell-num">TCS</th> : null}
                    <th className="cell-num">Final Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchRows.map((row) => (
                    <tr key={row.id}>
                      <td>{formatDateDdMmYyyy(row.date)}</td>
                      <td>{row.dispatchType ?? "—"}</td>
                      <td>
                        {row.lorryNumber?.trim() ? row.lorryNumber : "—"}
                      </td>
                      <td className="cell-num">
                        {row.weight != null
                          ? formatDispatchMt(row.weight)
                          : "—"}
                      </td>
                      <td className="cell-num">
                        {formatRate(row.basicRate)}
                      </td>
                      <td className="cell-num">{formatRate(row.gst)}</td>
                      {showTcs ? (
                        <td className="cell-num">{formatRate(row.tcs)}</td>
                      ) : null}
                      <td className="cell-num">
                        {row.finalAmount != null
                          ? formatRs(row.finalAmount)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="ledger-panel ledger-panel-funds">
            <h2 className="ledger-panel-title">Funds &amp; Discounts</h2>
            <div className="ledger-panel-body table-wrap-scroll">
              <table className="data payments-table">
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
          </section>
        </div>
      )}
    </div>
  );
}
