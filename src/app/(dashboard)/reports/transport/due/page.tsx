import Link from "next/link";
import { listTransportDueRows } from "@/lib/actions/transportDue";
import { TransportDueClient } from "./TransportDueClient";

type SearchParams = Promise<{
  dateStart?: string;
  dateEnd?: string;
}>;

export default async function TransportDuePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const dateStart = sp.dateStart?.trim() || "";
  const dateEnd = sp.dateEnd?.trim() || "";
  const rows = await listTransportDueRows({
    dateStart: dateStart || undefined,
    dateEnd: dateEnd || undefined,
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            <Link href="/reports">Report</Link>
            <span aria-hidden="true"> · </span>
            Transport
            <span aria-hidden="true"> · </span>
            Transport Due
          </p>
          <h1 className="page-title">Transport Due</h1>
          <p className="page-subtitle">
            Outstanding freight balances with transporters.
          </p>
        </div>
      </div>

      <TransportDueClient
        initialRows={rows}
        dateStart={dateStart}
        dateEnd={dateEnd}
      />
    </div>
  );
}
