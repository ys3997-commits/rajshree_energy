import Link from "next/link";
import { capitalizeName } from "@/lib/domain/format";
import type { HomePendingBillOwner } from "@/lib/actions/dashboard";

export function HomePendingBillsStrip({
  owners,
}: {
  owners: HomePendingBillOwner[];
}) {
  if (owners.length === 0) return null;

  return (
    <section className="home-section" aria-label="Pending bills">
      <div className="home-section-head">
        <h2 className="home-section-title">Pending bills</h2>
      </div>
      <div className="home-kpi-row home-pending-row">
        {owners.map((owner) => {
          const label = capitalizeName(owner.name) ?? owner.name;
          const href = `/bills?status=pending&approver=${encodeURIComponent(owner.name)}`;
          return (
            <Link key={owner.name} href={href} className="home-kpi">
              <span className="home-kpi-label">{label}</span>
              <span
                className={
                  owner.pending > 0
                    ? "home-kpi-value home-kpi-value-pending"
                    : "home-kpi-value"
                }
              >
                {owner.pending}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
