import {
  getVegLedger,
  listVegLedgerCustomers,
} from "@/lib/actions/vegLedger";
import { requirePage } from "@/lib/auth/access";
import { VegLedgerClient } from "./VegLedgerClient";

type SearchParams = Promise<{
  customerId?: string;
  vegId?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function VegLedgerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePage("reports-veg-ledger");
  const sp = await searchParams;
  const customerId = sp.customerId?.trim() || "";
  const vegId = sp.vegId?.trim() || "";
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const customers = await listVegLedgerCustomers();
  const ledger =
    customerId.length > 0
      ? await getVegLedger(customerId, { vegId, dateFrom, dateTo })
      : null;

  const selectedId =
    ledger?.customer.id ??
    (customers.some((c) => c.id === customerId) ? customerId : "");
  const selectedVegId =
    vegId && (ledger?.vegs.some((veg) => veg.id === vegId) ?? false)
      ? vegId
      : "";

  return (
    <VegLedgerClient
      customers={customers}
      customerId={selectedId}
      vegs={ledger?.vegs ?? []}
      vegId={selectedVegId}
      dateFrom={dateFrom}
      dateTo={dateTo}
      supplyRows={ledger?.supplyRows ?? []}
      fundRows={ledger?.fundRows ?? []}
      openingDue={ledger?.openingDue ?? null}
      quantity={ledger?.quantity ?? null}
      trucks={ledger?.trucks ?? null}
      payable={ledger?.payable ?? null}
      netPayable={ledger?.netPayable ?? null}
      fundPaid={ledger?.fundPaid ?? null}
    />
  );
}
