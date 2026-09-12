import {
  getCustomerLedger,
  listLedgerCustomers,
} from "@/lib/actions/ledger";
import { requirePage } from "@/lib/auth/access";
import { CUSTOMER_LEDGER_PAGE_KEY } from "@/lib/auth/report-exec-access";
import { LedgerClient } from "./LedgerClient";

type SearchParams = Promise<{
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function LedgerReportPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePage(CUSTOMER_LEDGER_PAGE_KEY);
  const sp = await searchParams;
  const customerId = sp.customerId?.trim() || "";
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const customers = await listLedgerCustomers();
  const ledger =
    customerId.length > 0
      ? await getCustomerLedger(customerId, { dateFrom, dateTo })
      : null;

  const selectedId =
    ledger?.customer.id ??
    (customers.some((c) => c.id === customerId) ? customerId : "");

  return (
    <LedgerClient
      customers={customers}
      customerId={selectedId}
      dateFrom={dateFrom}
      dateTo={dateTo}
      rows={ledger?.rows ?? []}
      openingDue={ledger?.openingDue ?? null}
      due={ledger?.due ?? null}
      overdue={ledger?.overdue ?? null}
    />
  );
}
