import { listDiscounts } from "@/lib/actions/discounts";
import { DiscountsClient } from "../DiscountsClient";
import { loadFundFlowParties } from "../fundFlowParties";
import { parseFundFlowType } from "../paymentsHref";

type SearchParams = Promise<{
  page?: string;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}>;

export default async function DiscountsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";
  const party = sp.party?.trim() || "";
  const type = parseFundFlowType(sp.type);
  const listFilter = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    party: party || undefined,
    type: type || undefined,
  };

  const [parties, discounts, exportDiscounts] = await Promise.all([
    loadFundFlowParties(),
    listDiscounts({ page, ...listFilter }),
    listDiscounts({ all: true, ...listFilter }),
  ]);

  return (
    <DiscountsClient
      initial={discounts}
      exportRows={exportDiscounts.rows}
      parties={parties}
      dateFrom={dateFrom}
      dateTo={dateTo}
      party={party}
      type={type}
    />
  );
}
