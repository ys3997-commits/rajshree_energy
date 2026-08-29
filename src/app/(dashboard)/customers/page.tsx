import { listCustomers, listCustomersPage } from "@/lib/actions/customers";
import {
  listCityOptions,
  listDealingCompanyOptions,
  listOwnerOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
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
    sectors,
    saleExecutives,
    dealingCompanies,
    owners,
  ] = await Promise.all([
    listCustomersPage({ page, customerId, category }),
    listCustomers(),
    listCityOptions(),
    listSectorOptions(),
    listSaleExecutiveOptions(),
    listDealingCompanyOptions(),
    listOwnerOptions(),
  ]);

  return (
    <CustomersClient
      initial={customers}
      customerOptions={allCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
      }))}
      cityOptions={cities.map((o) => ({ name: o.name, state: o.state }))}
      sectors={sectors.map((o) => o.name)}
      saleExecutives={saleExecutives.map((o) => o.name)}
      dealingCompanies={dealingCompanies.map((o) => o.name)}
      owners={owners.map((o) => o.name)}
    />
  );
}
