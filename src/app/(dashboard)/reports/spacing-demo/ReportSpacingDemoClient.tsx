"use client";

import Link from "next/link";
import { useState } from "react";

type ViewMode = "current" | "proposed";

const customerRows = [
  {
    customer: "Shree Cement Industries Pvt Ltd",
    city: "Raipur",
    state: "Chhattisgarh",
    due: "42,50,000.00",
    sales: "1,28,00,000.00",
    received: "85,50,000.00",
  },
  {
    customer: "UltraTech Trading Co",
    city: "Mumbai",
    state: "Maharashtra",
    due: "18,75,400.00",
    sales: "64,20,000.00",
    received: "45,44,600.00",
  },
  {
    customer: "ACC Limited — Wadi Plant",
    city: "Gulbarga",
    state: "Karnataka",
    due: "9,12,000.00",
    sales: "29,40,000.00",
    received: "20,28,000.00",
  },
];

const dispatchRows = [
  {
    date: "28/08/2026",
    lorry: "CG 04 AB 1234",
    weight: "32.50",
    vessel: "MV Ocean Star",
    quality: "SAF — South Africa",
    vendor: "Global Coal Traders",
    customer: "Shree Cement Industries",
    freight: "1,625.00",
  },
  {
    date: "26/08/2026",
    lorry: "MH 12 CD 5678",
    weight: "28.00",
    vessel: "MV Blue Horizon",
    quality: "IND — Indonesia",
    vendor: "Eastern Imports",
    customer: "UltraTech Trading Co",
    freight: "1,400.00",
  },
];

const collectionRows = [
  {
    customer: "Shree Cement Industries Pvt Ltd",
    pic: "Rajesh Kumar",
    phone: "98765 43210",
    due: "42,50,000.00",
    planned: "30/08/2026",
    executive: "Amit Sharma",
  },
  {
    customer: "UltraTech Trading Co",
    pic: "Priya Mehta",
    phone: "99887 76655",
    due: "18,75,400.00",
    planned: "02/09/2026",
    executive: "Vikram Singh",
  },
];

const ageingRows = [
  {
    customer: "Shree Cement Industries Pvt Ltd",
    total: "42,50,000",
    b1: "8,00,000",
    b2: "12,50,000",
    b3: "22,00,000",
  },
  {
    customer: "UltraTech Trading Co",
    total: "18,75,400",
    b1: "4,20,000",
    b2: "6,55,400",
    b3: "8,00,000",
  },
];

function tableClass(mode: ViewMode, extra = ""): string {
  const base = "data";
  if (mode === "proposed") {
    return [base, "report-screen-table", extra].filter(Boolean).join(" ");
  }
  return [base, extra].filter(Boolean).join(" ");
}

function CustomerAnalysisPreview({ mode }: { mode: ViewMode }) {
  const proposed = mode === "proposed";
  return (
    <div className="table-wrap">
      <div className="table-h-scroll"><table className={tableClass(mode)}>
        <thead>
          <tr>
            <th className={proposed ? "col-name" : undefined}>Customer</th>
            <th className={proposed ? "col-name" : undefined}>City</th>
            <th className={proposed ? "col-status" : undefined}>State</th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>Due</th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>Sales</th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>
              Received
            </th>
          </tr>
        </thead>
        <tbody>
          {customerRows.map((row) => (
            <tr key={row.customer}>
              <td className={proposed ? "col-name" : undefined}>
                {row.customer}
              </td>
              <td className={proposed ? "col-name" : undefined}>{row.city}</td>
              <td className={proposed ? "col-status" : undefined}>
                {row.state}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.due}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.sales}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.received}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

function DispatchRegisterPreview({ mode }: { mode: ViewMode }) {
  const proposed = mode === "proposed";
  const cls = tableClass(mode, "report-table dispatch-register-table");
  return (
    <div className="table-wrap table-wrap-scroll dispatch-register-table-wrap">
      <div className="table-h-scroll"><table className={cls}>
        <thead>
          <tr className="report-group-row">
            <th colSpan={5}>Dispatch</th>
            <th colSpan={2}>Purchase</th>
            <th colSpan={2}>Sale</th>
            <th>Transport</th>
          </tr>
          <tr>
            <th className={proposed ? "col-date" : undefined}>Date</th>
            <th className={proposed ? "col-code" : undefined}>Lorry no</th>
            <th className={proposed ? "col-qty cell-num" : "cell-num"}>
              Weight
            </th>
            <th className={proposed ? "col-name" : undefined}>Vessel</th>
            <th className={proposed ? "col-name" : undefined}>Quality</th>
            <th className={proposed ? "col-name" : undefined}>Vendor</th>
            <th className={proposed ? "col-name" : undefined}>Customer</th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>
              Freight
            </th>
          </tr>
        </thead>
        <tbody>
          {dispatchRows.map((row) => (
            <tr key={row.lorry}>
              <td className={proposed ? "col-date" : undefined}>{row.date}</td>
              <td className={proposed ? "col-code" : undefined}>{row.lorry}</td>
              <td className={proposed ? "col-qty cell-num" : "cell-num"}>
                {row.weight}
              </td>
              <td className={proposed ? "col-name" : undefined}>
                {row.vessel}
              </td>
              <td className={proposed ? "col-name" : undefined}>
                {row.quality}
              </td>
              <td className={proposed ? "col-name" : undefined}>
                {row.vendor}
              </td>
              <td className={proposed ? "col-name" : undefined}>
                {row.customer}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.freight}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

function CollectionPreview({ mode }: { mode: ViewMode }) {
  const proposed = mode === "proposed";
  return (
    <div className="table-wrap">
      <div className="table-h-scroll"><table
        className={tableClass(
          mode,
          proposed ? "" : "payments-table collection-table",
        )}
      >
        <thead>
          <tr>
            <th className={proposed ? "col-name" : "collection-customer-col"}>
              Customer
            </th>
            <th className={proposed ? "col-name" : undefined}>
              Payment in charge
            </th>
            <th className={proposed ? "col-code" : undefined}>Phone</th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>Due</th>
            <th className={proposed ? "col-date" : undefined}>
              Planned call
            </th>
            <th className={proposed ? "col-name" : undefined}>
              Sales executive
            </th>
          </tr>
        </thead>
        <tbody>
          {collectionRows.map((row) => (
            <tr key={row.customer}>
              <td
                className={
                  proposed ? "col-name" : "collection-customer-col"
                }
              >
                {row.customer}
              </td>
              <td className={proposed ? "col-name" : undefined}>{row.pic}</td>
              <td className={proposed ? "col-code" : undefined}>
                {row.phone}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.due}
              </td>
              <td className={proposed ? "col-date" : undefined}>
                {row.planned}
              </td>
              <td className={proposed ? "col-name" : undefined}>
                {row.executive}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

function AgeingPreview({ mode }: { mode: ViewMode }) {
  const proposed = mode === "proposed";
  return (
    <div className="table-wrap ageing-table-wrap">
      <div className="table-h-scroll"><table
        className={tableClass(mode, proposed ? "" : "ageing-table")}
      >
        <thead>
          <tr className={proposed ? undefined : "ageing-days-row"}>
            <th className={proposed ? "col-name" : "ageing-customer-col"}>
              Customer
            </th>
            <th
              className={
                proposed
                  ? "col-amt cell-num"
                  : "cell-num ageing-total-col"
              }
            >
              Total due
            </th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>
              0–10 days
            </th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>
              11–20 days
            </th>
            <th className={proposed ? "col-amt cell-num" : "cell-num"}>
              21–30 days
            </th>
          </tr>
        </thead>
        <tbody>
          {ageingRows.map((row) => (
            <tr key={row.customer}>
              <td
                className={
                  proposed ? "col-name" : "ageing-customer-col"
                }
              >
                {row.customer}
              </td>
              <td
                className={
                  proposed
                    ? "col-amt cell-num"
                    : "cell-num ageing-total-col"
                }
              >
                {row.total}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.b1}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.b2}
              </td>
              <td className={proposed ? "col-amt cell-num" : "cell-num"}>
                {row.b3}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

const REPORTS = [
  {
    id: "customer",
    title: "Customer Analysis",
    desc: "Customer, location, and fund columns.",
    render: CustomerAnalysisPreview,
  },
  {
    id: "dispatch",
    title: "Master Dispatch",
    desc: "Grouped headers and wide dispatch register.",
    render: DispatchRegisterPreview,
  },
  {
    id: "collection",
    title: "Collection Engine",
    desc: "Customer, contacts, due, and planned call.",
    render: CollectionPreview,
  },
  {
    id: "ageing",
    title: "Ageing Report",
    desc: "Customer with due buckets.",
    render: AgeingPreview,
  },
] as const;

export function ReportSpacingDemoClient() {
  const [mode, setMode] = useState<ViewMode>("proposed");
  const [active, setActive] = useState<(typeof REPORTS)[number]["id"]>(
    "collection",
  );

  const report = REPORTS.find((item) => item.id === active) ?? REPORTS[0];
  const Preview = report.render;

  return (
    <div className="page-stack">
      <p className="page-eyebrow">
        <Link href="/reports">Report</Link> / Preview
      </p>
      <div className="page-header">
        <div>
          <h1 className="page-title">How reports will look</h1>
          <p className="page-subtitle">
            Sample layouts using your real report styles. Switch between{" "}
            <strong>Current</strong> and <strong>Proposed</strong> — live reports
            are not changed yet.
          </p>
        </div>
        <Link href="/reports" className="btn btn-secondary">
          Back to reports
        </Link>
      </div>

      <div className="report-spacing-demo-toolbar">
        <div className="report-spacing-demo-toggle" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "current"}
            className={
              mode === "current"
                ? "report-spacing-demo-toggle-btn is-active"
                : "report-spacing-demo-toggle-btn"
            }
            onClick={() => setMode("current")}
          >
            Current
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "proposed"}
            className={
              mode === "proposed"
                ? "report-spacing-demo-toggle-btn is-active"
                : "report-spacing-demo-toggle-btn"
            }
            onClick={() => setMode("proposed")}
          >
            Proposed
          </button>
        </div>
        <p className="report-spacing-demo-mode-note">
          {mode === "proposed"
            ? "Even column gaps, named column widths, slightly tighter padding."
            : "Today’s spacing — varies by report."}
        </p>
      </div>

      <div className="report-spacing-demo-tabs">
        {REPORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              active === item.id
                ? "report-spacing-demo-tab is-active"
                : "report-spacing-demo-tab"
            }
            onClick={() => setActive(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>

      <section
        className={
          mode === "proposed"
            ? "report-spacing-demo-section report-spacing-demo-section-proposed"
            : "report-spacing-demo-section"
        }
      >
        <h2 className="report-spacing-demo-title">{report.title}</h2>
        <p className="report-spacing-demo-note">{report.desc}</p>
        <Preview mode={mode} />
      </section>

      <section className="report-spacing-demo-legend">
        <p className="report-spacing-demo-note">
          When you are happy with <strong>Proposed</strong>, say{" "}
          <strong>use proposed</strong>. Want more or less gap? Say{" "}
          <strong>tighter</strong> or <strong>looser</strong>.
        </p>
      </section>
    </div>
  );
}
