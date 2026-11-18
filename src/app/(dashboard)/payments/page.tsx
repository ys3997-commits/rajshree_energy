import { redirect } from "next/navigation";
import { BankRegister } from "./BankRegister";

type SearchParams = Promise<{
  page?: string;
  tab?: string;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
  account?: string;
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
    redirect(qs ? `/reports/bank/discount?${qs}` : "/reports/bank/discount");
  }

  return <BankRegister />;
}
