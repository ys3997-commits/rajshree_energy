import Link from "next/link";
import { formatDispatchMt, formatRs } from "@/lib/domain/format";

type Props = {
  date: string;
  dispatchedQuantity: string;
  profit: string;
  fundReceived: string;
  overdue: string;
  unsoldQuantity: string;
};

export function HomeKpiStrip({
  date,
  dispatchedQuantity,
  profit,
  fundReceived,
  overdue,
  unsoldQuantity,
}: Props) {
  const tiles = [
    {
      label: "Yesterday's dispatched MT",
      value: formatDispatchMt(dispatchedQuantity),
      href: `/reports/master-dispatch?dateFrom=${date}&dateTo=${date}`,
    },
    {
      label: "Yesterday's profit",
      value: formatRs(profit),
      href: `/reports/profit-analysis?dateFrom=${date}&dateTo=${date}`,
    },
    {
      label: "Yesterday's fund received",
      value: formatRs(fundReceived),
      href: "/payments",
    },
    {
      label: "Today's overdue",
      value: formatRs(overdue),
      href: "/reports/collection",
    },
    {
      label: "Today's unsold stock",
      value: formatDispatchMt(unsoldQuantity),
      href: "/reports/product",
    },
  ];

  return (
    <section className="home-section" aria-label="Key Information">
      <div className="home-section-head">
        <h2 className="home-section-title">Key Information</h2>
      </div>
      <div className="home-kpi-row">
        {tiles.map((tile) => (
          <Link key={tile.label} href={tile.href} className="home-kpi">
            <span className="home-kpi-label">{tile.label}</span>
            <span className="home-kpi-value">{tile.value}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
