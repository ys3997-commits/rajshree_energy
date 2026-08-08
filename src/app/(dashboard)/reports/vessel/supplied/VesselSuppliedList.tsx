"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TableDownloadButtons } from "@/components/TableDownloadButtons";
import type { VesselSuppliedListRow } from "@/lib/actions/reports";
import {
  formatQualityClass,
  formatSaleOrderMt,
} from "@/lib/domain/format";

type DomesticFilter = "" | "domestic" | "imported";

function formatSupplyShare(quantity: string, totalQuantity: string): string {
  const qty = Number(quantity);
  const total = Number(totalQuantity);
  const pct =
    !Number.isFinite(qty) || !Number.isFinite(total) || total === 0
      ? 0
      : (qty * 100) / total;
  return `${formatSaleOrderMt(quantity)}\u00A0\u00A0\u00A0|\u00A0\u00A0\u00A0${pct.toFixed(2)}%`;
}

export function VesselSuppliedList({
  vessels,
}: {
  vessels: VesselSuppliedListRow[];
}) {
  const [domesticFilter, setDomesticFilter] = useState<DomesticFilter>("");
  const [qualityFilter, setQualityFilter] = useState("");

  const qualityOptions = useMemo(() => {
    const names = new Set<string>();
    for (const v of vessels) {
      const name = v.qualityClass?.qualityOption.name;
      if (name) names.add(name);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [vessels]);

  const filtered = useMemo(() => {
    return vessels.filter((v) => {
      const qc = v.qualityClass;
      if (domesticFilter === "domestic" && qc?.domestic !== true) return false;
      if (domesticFilter === "imported" && qc?.domestic !== false) return false;
      if (
        qualityFilter &&
        qc?.qualityOption.name !== qualityFilter
      ) {
        return false;
      }
      return true;
    });
  }, [vessels, domesticFilter, qualityFilter]);

  const exportColumns = [
    { key: "vessel", header: "Vessel name" },
    { key: "quality", header: "Quality class" },
    { key: "total", header: "Total quantities", align: "right" as const },
    {
      key: "industry",
      header: "Supplied to industry",
      align: "right" as const,
    },
    {
      key: "traderVendor",
      header: "Supplied to trader & vendor",
      align: "right" as const,
    },
  ];

  const exportRows = useMemo(
    () =>
      filtered.map((v) => ({
        vessel: v.active ? v.vesselName : `${v.vesselName} · Inactive`,
        quality: formatQualityClass(v.qualityClass),
        total: formatSaleOrderMt(v.totalQuantity),
        industry: formatSupplyShare(v.industryQuantity, v.totalQuantity),
        traderVendor: formatSupplyShare(
          v.traderVendorQuantity,
          v.totalQuantity,
        ),
      })),
    [filtered],
  );

  return (
    <div className="vessel-report-list">
      <div className="filters">
        <label>
          Domestic / Imported
          <select
            value={domesticFilter}
            onChange={(e) =>
              setDomesticFilter(e.target.value as DomesticFilter)
            }
          >
            <option value="">All</option>
            <option value="domestic">Domestic</option>
            <option value="imported">Imported</option>
          </select>
        </label>
        <label>
          Quality
          <select
            value={qualityFilter}
            onChange={(e) => setQualityFilter(e.target.value)}
          >
            <option value="">All</option>
            {qualityOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <TableDownloadButtons
          title="Vessel Supplied"
          filenameBase="vessel-supplied"
          columns={exportColumns}
          rows={exportRows}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="home-empty">No vessels match your filters.</p>
      ) : (
        <div className="table-wrap table-wrap-scroll">
          <table className="data report-table">
            <thead>
              <tr>
                <th>Vessel name</th>
                <th>Quality class</th>
                <th className="num">Total quantities</th>
                <th className="num">Supplied to industry</th>
                <th className="num">Supplied to trader &amp; vendor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr
                  key={v.id}
                  className={
                    v.active
                      ? "ca-list-row"
                      : "ca-list-row customer-row-inactive"
                  }
                >
                  <td>
                    <Link
                      href={`/reports/vessel/supplied/${v.id}`}
                      className="ca-list-link"
                    >
                      {v.vesselName}
                    </Link>
                    {!v.active ? " · Inactive" : ""}
                  </td>
                  <td>{formatQualityClass(v.qualityClass)}</td>
                  <td className="num">{formatSaleOrderMt(v.totalQuantity)}</td>
                  <td className="num">
                    {formatSupplyShare(v.industryQuantity, v.totalQuantity)}
                  </td>
                  <td className="num">
                    {formatSupplyShare(
                      v.traderVendorQuantity,
                      v.totalQuantity,
                    )}
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
