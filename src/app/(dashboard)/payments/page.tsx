import { listPayments } from "@/lib/actions/payments";
import { redirect } from "next/navigation";
import { PaymentsClient } from "./PaymentsClient";
import { loadFundFlowParties } from "./fundFlowParties";
import { parseFundFlowType } from "./paymentsHref";

type SearchParams = Promise<{
  page?: string;
  tab?: string;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}>;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  if (sp.tab === "collection") {
    redirect("/reports/collection");
  }
  if (sp.tab === "vendor-collection") {
    redirect("/reports/collection/vendor");
  }
  if (sp.tab === "discount") {
    const params = new URLSearchParams();
    if (sp.page) params.set("page", sp.page);
    if (sp.dateFrom) params.set("dateFrom", sp.dateFrom);
    if (sp.dateTo) params.set("dateTo", sp.dateTo);
    if (sp.party) params.set("party", sp.party);
    if (sp.type) params.set("type", sp.type);
    const qs = params.toString();
    redirect(qs ? `/payments/discount?${qs}` : "/payments/discount");
  }

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

  const [parties, payments, exportPayments] = await Promise.all([
    loadFundFlowParties(),
    listPayments({ page, ...listFilter }),
    listPayments({ all: true, ...listFilter }),
  ]);

  return (
    <PaymentsClient
      initial={payments}
      exportRows={exportPayments.rows}
      parties={parties}
      dateFrom={dateFrom}
      dateTo={dateTo}
      party={party}
      type={type}
    />
  );
}
