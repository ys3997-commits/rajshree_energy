import { listCustomers } from "@/lib/actions/customers";
import {
  listCityOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage() {
  const [customers, cities, states, sectors, saleExecutives] =
    await Promise.all([
      listCustomers(),
      listCityOptions(),
      listStateOptions(),
      listSectorOptions(),
      listSaleExecutiveOptions(),
    ]);

  return (
    <CustomersClient
      initial={customers.map(
        ({ due: _due, plannedCollectionCallDate: _planned, ...c }) => c,
      )}
      cities={cities.map((o) => o.name)}
      states={states.map((o) => o.name)}
      sectors={sectors.map((o) => o.name)}
      saleExecutives={saleExecutives.map((o) => o.name)}
    />
  );
}
