import { listCustomersPage } from "@/lib/actions/customers";
import {
  listCityOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import { CustomersClient } from "./CustomersClient";

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const q = (sp.q ?? "").trim();

  const [customers, cities, states, sectors, saleExecutives] =
    await Promise.all([
      listCustomersPage({ page, q }),
      listCityOptions(),
      listStateOptions(),
      listSectorOptions(),
      listSaleExecutiveOptions(),
    ]);

  return (
    <CustomersClient
      initial={customers}
      cities={cities.map((o) => o.name)}
      states={states.map((o) => o.name)}
      sectors={sectors.map((o) => o.name)}
      saleExecutives={saleExecutives.map((o) => o.name)}
    />
  );
}
