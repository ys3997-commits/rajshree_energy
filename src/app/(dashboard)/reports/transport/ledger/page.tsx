import {
  getTransportLedger,
  listTransportLedgerTransporters,
} from "@/lib/actions/transportLedger";
import { TransportLedgerClient } from "./TransportLedgerClient";

type SearchParams = Promise<{
  transporterId?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function TransportLedgerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const transporterId = sp.transporterId?.trim() || "";
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const transporters = await listTransportLedgerTransporters();
  const ledger =
    transporterId.length > 0
      ? await getTransportLedger(transporterId, { dateFrom, dateTo })
      : null;

  const selectedId =
    ledger?.transporter.id ??
    (transporters.some((t) => t.id === transporterId) ? transporterId : "");

  return (
    <TransportLedgerClient
      transporters={transporters}
      transporterId={selectedId}
      dateFrom={dateFrom}
      dateTo={dateTo}
      rows={ledger?.rows ?? []}
      openingDue={ledger?.openingDue ?? null}
      due={ledger?.due ?? null}
      dueAfterTds={ledger?.dueAfterTds ?? null}
    />
  );
}
