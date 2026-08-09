import {
  getCustomerLedger,
  listLedgerCustomers,
} from "@/lib/actions/ledger";
import { LedgerClient } from "./LedgerClient";

type SearchParams = Promise<{ customerId?: string }>;

export default async function LedgerReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const customerId = sp.customerId?.trim() || "";

  const customers = await listLedgerCustomers();
  const ledger =
    customerId.length > 0 ? await getCustomerLedger(customerId) : null;

  const selectedId =
    ledger?.customer.id ??
    (customers.some((c) => c.id === customerId) ? customerId : "");

  return (
    <LedgerClient
      customers={customers}
      customerId={selectedId}
      rows={ledger?.rows ?? []}
    />
  );
}
