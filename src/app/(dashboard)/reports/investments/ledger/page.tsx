import {
  getInvestmentLedger,
  listInvestLedgerCompanies,
} from "@/lib/actions/investmentLedger";
import { requirePage } from "@/lib/auth/access";
import { InvestLedgerClient } from "./InvestLedgerClient";

const INVEST_LEDGER_PAGE_KEY = "reports-invest-ledger";

type SearchParams = Promise<{
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
}>;

export default async function InvestLedgerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePage(INVEST_LEDGER_PAGE_KEY);
  const sp = await searchParams;
  const companyId = sp.companyId?.trim() || "";
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";

  const companies = await listInvestLedgerCompanies();
  const ledger =
    companyId.length > 0
      ? await getInvestmentLedger(companyId, { dateFrom, dateTo })
      : null;

  const selectedId =
    ledger?.company.id ??
    (companies.some((company) => company.id === companyId) ? companyId : "");

  return (
    <InvestLedgerClient
      companies={companies}
      companyId={selectedId}
      dateFrom={dateFrom}
      dateTo={dateTo}
      returnRows={ledger?.returnRows ?? []}
      fundRows={ledger?.fundRows ?? []}
      openingDue={ledger?.openingDue ?? null}
      currentDue={ledger?.currentDue ?? null}
    />
  );
}
