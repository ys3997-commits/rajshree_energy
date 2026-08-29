"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { SaleGeoAnalysisReport } from "@/lib/actions/reports";
import { formatSaleOrderMt } from "@/lib/domain/format";

type ViewMode = "state" | "city";

function formatPct(value: string): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return `${value}%`;
  return `${n.toFixed(2)}%`;
}

function titleCasePlace(value: string): string {
  if (value === "Unspecified") return value;
  return value
    .split(/\s+/)
    .map((part) =>
      part
        .split("-")
        .map((seg) =>
          seg ? seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase() : seg,
        )
        .join("-"),
    )
    .join(" ");
}

export function SaleAnalysisClient({
  report,
  dateFrom,
  dateTo,
}: {
  report: SaleGeoAnalysisReport;
  dateFrom: string;
  dateTo: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("state");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);

  useEffect(() => {
    setFrom(dateFrom);
    setTo(dateTo);
  }, [dateFrom, dateTo]);

  function applyDates(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("dateFrom", from);
    if (to) params.set("dateTo", to);
    const qs = params.toString();
    router.push(qs ? `/reports/analysis?${qs}` : "/reports/analysis");
  }

  const q = query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!q) return report.products;
    return report.products
      .map((product) => {
        const productMatch =
          product.product.toLowerCase().includes(q) ||
          (product.productDetail?.toLowerCase().includes(q) ?? false);

        const states = product.states
          .map((state) => {
            const stateMatch = state.state.toLowerCase().includes(q);
            const cities = state.cities.filter(
              (city) =>
                productMatch ||
                stateMatch ||
                city.city.toLowerCase().includes(q),
            );
            if (productMatch || stateMatch || cities.length > 0) {
              return {
                ...state,
                cities: productMatch || stateMatch ? state.cities : cities,
              };
            }
            return null;
          })
          .filter((s): s is NonNullable<typeof s> => s != null);

        if (productMatch || states.length > 0) {
          return { ...product, states: productMatch ? product.states : states };
        }
        return null;
      })
      .filter((p): p is NonNullable<typeof p> => p != null);
  }, [report.products, q]);

  const filteredCityProducts = useMemo(() => {
    if (!q) return report.cityProducts;
    return report.cityProducts
      .map((product) => {
        const productMatch =
          product.product.toLowerCase().includes(q) ||
          (product.productDetail?.toLowerCase().includes(q) ?? false);
        const cities = product.cities.filter(
          (city) =>
            productMatch ||
            city.city.toLowerCase().includes(q) ||
            city.state.toLowerCase().includes(q),
        );
        if (productMatch || cities.length > 0) {
          return {
            ...product,
            cities: productMatch ? product.cities : cities,
          };
        }
        return null;
      })
      .filter((p): p is NonNullable<typeof p> => p != null);
  }, [report.cityProducts, q]);

  const stateExportColumns = [
    { key: "product", header: "Product" },
    { key: "state", header: "State" },
    { key: "stateQty", header: "State qty", align: "right" as const },
    { key: "statePct", header: "State %", align: "right" as const },
    { key: "city", header: "City" },
    { key: "cityQty", header: "City qty", align: "right" as const },
    { key: "cityPct", header: "City %", align: "right" as const },
  ];

  const stateExportRows = useMemo(() => {
    const rows: Array<Record<string, string>> = [];
    for (const product of filteredProducts) {
      for (const state of product.states) {
        state.cities.forEach((city, index) => {
          rows.push({
            product: index === 0 ? product.product : "",
            state: index === 0 ? titleCasePlace(state.state) : "",
            stateQty: index === 0 ? state.quantity : "",
            statePct: index === 0 ? formatPct(state.percent) : "",
            city: titleCasePlace(city.city),
            cityQty: city.quantity,
            cityPct: formatPct(city.percent),
          });
        });
      }
    }
    return rows;
  }, [filteredProducts]);

  const cityExportColumns = [
    { key: "product", header: "Product" },
    { key: "city", header: "City" },
    { key: "cityQty", header: "City qty", align: "right" as const },
    { key: "cityPct", header: "City %", align: "right" as const },
    { key: "state", header: "State" },
  ];

  const cityExportRows = useMemo(() => {
    const rows: Array<Record<string, string>> = [];
    for (const product of filteredCityProducts) {
      product.cities.forEach((city, index) => {
        rows.push({
          product: index === 0 ? product.product : "",
          city: titleCasePlace(city.city),
          cityQty: city.quantity,
          cityPct: formatPct(city.percent),
          state: titleCasePlace(city.state),
        });
      });
    }
    return rows;
  }, [filteredCityProducts]);

  return (
    <div className="sale-analysis-report">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Analysis
            <span aria-hidden="true"> · </span>
            Sale Analysis
          </p>
          <h1 className="page-title">Sale Analysis</h1>
          <p className="page-subtitle">
            Sale-side dispatched quantity by product, with state and city share
            of each product total.
          </p>
        </div>
      </div>

      <div className="sale-analysis-summary">
        <div className="sale-analysis-stat">
          <span className="sale-analysis-stat-label">Total sold</span>
          <span className="sale-analysis-stat-value">
            {formatSaleOrderMt(report.totalQuantity)}
          </span>
        </div>
        <div className="sale-analysis-stat">
          <span className="sale-analysis-stat-label">Products</span>
          <span className="sale-analysis-stat-value">{report.productCount}</span>
        </div>
        <div className="sale-analysis-stat">
          <span className="sale-analysis-stat-label">States</span>
          <span className="sale-analysis-stat-value">{report.stateCount}</span>
        </div>
        <div className="sale-analysis-stat">
          <span className="sale-analysis-stat-label">Cities</span>
          <span className="sale-analysis-stat-value">{report.cityCount}</span>
        </div>
      </div>

      <div className="filters sale-analysis-filters">
        <label>
          View
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ViewMode)}
          >
            <option value="state">State-wise</option>
            <option value="city">City-wise</option>
          </select>
        </label>
        <label>
          Search
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Product, state, city…"
            autoComplete="off"
          />
        </label>
        <form className="sale-analysis-date-form" onSubmit={applyDates}>
          <label>
            From
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button type="submit" className="btn btn-secondary">
            Apply dates
          </button>
        </form>
        <TableDownloadButtons
          title={
            mode === "state"
              ? "Sale Analysis — State-wise"
              : "Sale Analysis — City-wise"
          }
          filenameBase={
            mode === "state" ? "sale-analysis-state" : "sale-analysis-city"
          }
          columns={mode === "state" ? stateExportColumns : cityExportColumns}
          rows={mode === "state" ? stateExportRows : cityExportRows}
        />
      </div>

      {mode === "state" ? (
        filteredProducts.length === 0 ? (
          <p className="home-empty">No sale dispatches match your filters.</p>
        ) : (
          <div className="table-wrap table-wrap-scroll">
            <div className="table-h-scroll"><table className="data sale-analysis-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>State</th>
                  <th className="cell-num">State qty</th>
                  <th className="cell-num">State %</th>
                  <th>City</th>
                  <th className="cell-num">City qty</th>
                  <th className="cell-num">City %</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const productRowSpan = product.states.reduce(
                    (sum, state) => sum + Math.max(state.cities.length, 1),
                    0,
                  );
                  let productRendered = false;

                  return product.states.map((state) => {
                    const cities =
                      state.cities.length > 0
                        ? state.cities
                        : [
                            {
                              city: "Unspecified",
                              quantity: "0.00",
                              percent: "0.00",
                            },
                          ];
                    const stateRowSpan = cities.length;
                    let stateRendered = false;

                    return cities.map((city, cityIndex) => {
                      const showProduct = !productRendered;
                      const showState = !stateRendered;
                      if (showProduct) productRendered = true;
                      if (showState) stateRendered = true;

                      return (
                        <tr
                          key={`${product.productKey}-${state.state}-${city.city}-${cityIndex}`}
                          className={
                            showProduct
                              ? "sale-analysis-product-start"
                              : undefined
                          }
                        >
                          {showProduct ? (
                            <td
                              className="sale-analysis-product-cell"
                              rowSpan={productRowSpan}
                            >
                              <div className="sale-analysis-product-name">
                                {product.product}
                              </div>
                              {product.productDetail ? (
                                <div className="sale-analysis-product-detail">
                                  {product.productDetail}
                                </div>
                              ) : null}
                              <div className="sale-analysis-product-total">
                                {formatSaleOrderMt(product.quantity)} ·{" "}
                                {formatPct(product.percent)} of all sales
                              </div>
                            </td>
                          ) : null}
                          {showState ? (
                            <td rowSpan={stateRowSpan}>
                              {titleCasePlace(state.state)}
                            </td>
                          ) : null}
                          {showState ? (
                            <td className="cell-num" rowSpan={stateRowSpan}>
                              {formatSaleOrderMt(state.quantity)}
                            </td>
                          ) : null}
                          {showState ? (
                            <td className="cell-num" rowSpan={stateRowSpan}>
                              {formatPct(state.percent)}
                            </td>
                          ) : null}
                          <td>{titleCasePlace(city.city)}</td>
                          <td className="cell-num">
                            {formatSaleOrderMt(city.quantity)}
                          </td>
                          <td className="cell-num">{formatPct(city.percent)}</td>
                        </tr>
                      );
                    });
                  });
                })}
              </tbody>
            </table></div>
          </div>
        )
      ) : filteredCityProducts.length === 0 ? (
        <p className="home-empty">No sale dispatches match your filters.</p>
      ) : (
        <div className="table-wrap table-wrap-scroll">
          <div className="table-h-scroll"><table className="data sale-analysis-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>City</th>
                <th className="cell-num">City qty</th>
                <th className="cell-num">City %</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {filteredCityProducts.map((product) => {
                const cities =
                  product.cities.length > 0
                    ? product.cities
                    : [
                        {
                          city: "Unspecified",
                          state: "Unspecified",
                          quantity: "0.00",
                          percent: "0.00",
                        },
                      ];
                const rowSpan = cities.length;

                return cities.map((city, index) => (
                  <tr
                    key={`${product.productKey}-${city.city}-${city.state}-${index}`}
                    className={
                      index === 0 ? "sale-analysis-product-start" : undefined
                    }
                  >
                    {index === 0 ? (
                      <td
                        className="sale-analysis-product-cell"
                        rowSpan={rowSpan}
                      >
                        <div className="sale-analysis-product-name">
                          {product.product}
                        </div>
                        {product.productDetail ? (
                          <div className="sale-analysis-product-detail">
                            {product.productDetail}
                          </div>
                        ) : null}
                        <div className="sale-analysis-product-total">
                          {formatSaleOrderMt(product.quantity)} ·{" "}
                          {formatPct(product.percent)} of all sales
                        </div>
                      </td>
                    ) : null}
                    <td>{titleCasePlace(city.city)}</td>
                    <td className="cell-num">{formatSaleOrderMt(city.quantity)}</td>
                    <td className="cell-num">{formatPct(city.percent)}</td>
                    <td>{titleCasePlace(city.state)}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
