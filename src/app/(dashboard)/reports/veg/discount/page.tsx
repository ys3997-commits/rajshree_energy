import { listVegs } from "@/lib/actions/veg";
import { listVegDiscounts } from "@/lib/actions/vegDiscounts";
import { requirePage } from "@/lib/auth/access";
import { parseVegFlowType } from "../vegHref";
import { VegDiscountsClient } from "./VegDiscountsClient";

type SearchParams = Promise<{
  page?: string;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}>;

export default async function VegDiscountPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePage("reports-veg-discount");
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";
  const party = sp.party?.trim() || "";
  const type = parseVegFlowType(sp.type);
  const listFilter = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    party: party || undefined,
    type: type || undefined,
  };

  const [vegs, discounts, exportDiscounts] = await Promise.all([
    listVegs(),
    listVegDiscounts({ page, ...listFilter }),
    listVegDiscounts({ all: true, ...listFilter }),
  ]);

  return (
    <VegDiscountsClient
      initial={discounts}
      exportRows={exportDiscounts.rows}
      vegs={vegs}
      dateFrom={dateFrom}
      dateTo={dateTo}
      party={party}
      type={type}
    />
  );
}
