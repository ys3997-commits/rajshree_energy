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
  saleExecutive?: string;
  city?: string;
  state?: string;
  category?: string;
  sector?: string;
}>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const customerId = (sp.customerId ?? "").trim();
  const saleExecutive = (sp.saleExecutive ?? "").trim();
  const city = (sp.city ?? "").trim();
  const state = (sp.state ?? "").trim();
  const category = (sp.category ?? "").trim();
  const sector = (sp.sector ?? "").trim();

  const [
    customers,
    allCustomers,
    cities,
    states,
    sectors,
    saleExecutives,
    dealingCompanies,
  ] = await Promise.all([
    listCustomersPage({
      page,
      customerId,
      saleExecutive,
      city,
      state,
      category,
      sector,
    }),
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
      cityOptions={cities.map((o) => ({ name: o.name, state: o.state }))}
      stateOptions={states.map((o) => o.name)}
      sectors={sectors.map((o) => o.name)}
      saleExecutives={saleExecutives.map((o) => o.name)}
      dealingCompanies={dealingCompanies.map((o) => o.name)}
    />
  );
}
