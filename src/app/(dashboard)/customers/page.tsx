import { listCustomers, listCustomersPage } from "@/lib/actions/customers";
import {
  listCityOptions,
  listDealingCompanyOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import { CustomersClient } from "./CustomersClient";

type SearchParams = Promise<{
  page?: string;
  customerId?: string;
  category?: string;
}>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const customerId = (sp.customerId ?? "").trim();
  const category = (sp.category ?? "").trim();

  const [
    customers,
    allCustomers,
    cities,
    states,
    sectors,
    saleExecutives,
    dealingCompanies,
  ] = await Promise.all([
    listCustomersPage({ page, customerId, category }),
    listCustomers(),
    listCityOptions(),
    listStateOptions(),
    listSectorOptions(),
    listSaleExecutiveOptions(),
    listDealingCompanyOptions(),
  ]);

  return (
    <CustomersClient
      initial={customers}
      customerOptions={allCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
      }))}
      cities={cities.map((o) => o.name)}
      states={states.map((o) => o.name)}
      sectors={sectors.map((o) => o.name)}
      saleExecutives={saleExecutives.map((o) => o.name)}
      dealingCompanies={dealingCompanies.map((o) => o.name)}
    />
  );
}
