"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { CustomerCategory } from "@/generated/prisma";
import { formatCustomerCategory } from "@/lib/domain/format";

type CustomerRow = {
  id: string;
  name: string;
  category: CustomerCategory;
  active: boolean;
  city: string | null;
  state: string | null;
};

export function CustomerAnalysisList({
  customers,
}: {
  customers: CustomerRow[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      const haystack = [
        c.name,
        c.city,
        c.state,
        formatCustomerCategory(c.category),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [customers, query]);

  const exportColumns = [
    { key: "customer", header: "Customer" },
    { key: "category", header: "Category" },
    { key: "location", header: "Location" },
    { key: "status", header: "Status" },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((c) => ({
        customer: c.name,
        category: formatCustomerCategory(c.category),
        location: [c.city, c.state].filter(Boolean).join(", ") || "—",
        status: c.active ? "Active" : "Inactive",
      })),
    [filtered],
  );

  return (
    <div className="customer-analysis-list">
      <div className="filters">
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, city, state, category…"
            autoComplete="off"
          />
        </label>
        <TableDownloadButtons
          title="Customer analysis"
          filenameBase="customer-analysis"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">No customers match your search.</p>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={
                    c.active
                      ? "ca-list-row"
                      : "ca-list-row customer-row-inactive"
                  }
                >
                  <td>
                    <Link
                      href={`/reports/customer-analysis/${c.id}`}
                      className="ca-list-link"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td>{formatCustomerCategory(c.category)}</td>
                  <td>
                    {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td>{c.active ? "Active" : "Inactive"}</td>
                  <td className="num">
                    <Link
                      href={`/reports/customer-analysis/${c.id}`}
                      className="btn-link"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
