import { listVegs } from "@/lib/actions/veg";
import { listVegPayments } from "@/lib/actions/vegPayments";
import { requirePage } from "@/lib/auth/access";
import { VegPaymentsClient } from "./VegPaymentsClient";

type SearchParams = Promise<{
  page?: string;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
}>;

export default async function VegPaymentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePage("reports-veg-payment");
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";
  const party = sp.party?.trim() || "";
  const listFilter = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    party: party || undefined,
  };

  const [vegs, payments, exportPayments] = await Promise.all([
    listVegs(),
    listVegPayments({ page, ...listFilter }),
    listVegPayments({ all: true, ...listFilter }),
  ]);

  return (
    <VegPaymentsClient
      initial={payments}
      exportRows={exportPayments.rows}
      vegs={vegs}
      dateFrom={dateFrom}
      dateTo={dateTo}
      party={party}
    />
  );
}
