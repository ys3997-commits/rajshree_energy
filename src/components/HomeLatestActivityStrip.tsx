import Link from "next/link";
import { formatDateDdMmYyyy } from "@/lib/domain/format";

type Props = {
  purchaseSalesDate: string | null;
  paymentDate: string | null;
  discountDate: string | null;
};

export function HomeLatestActivityStrip({
  purchaseSalesDate,
  paymentDate,
  discountDate,
}: Props) {
  const tiles = [
    {
      label: "Purchase & sales",
      value: formatDateDdMmYyyy(purchaseSalesDate),
      href: purchaseSalesDate
        ? `/dispatches?dispatchDate=${purchaseSalesDate}`
        : "/dispatches",
    },
    {
      label: "Bank received & Payment",
      value: formatDateDdMmYyyy(paymentDate),
      href: "/payments",
    },
    {
      label: "Discount received & paid",
      value: formatDateDdMmYyyy(discountDate),
      href: "/payments/discount",
    },
  ];

  return (
    <section className="home-section" aria-label="Latest Entry">
      <div className="home-section-head">
        <h2 className="home-section-title">Latest Entry</h2>
      </div>
      <div className="home-kpi-row home-latest-row">
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
