import { listCustomers } from "@/lib/actions/customers";
import {
  listCityOptions,
  listSaleExecutiveOptions,
  listSectorOptions,
  listStateOptions,
} from "@/lib/actions/option-lists";
import { listStaff } from "@/lib/actions/staff";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage() {
  const [customers, staff, cities, states, sectors, saleExecutives] =
    await Promise.all([
      listCustomers(),
      listStaff(),
      listCityOptions(),
      listStateOptions(),
      listSectorOptions(),
      listSaleExecutiveOptions(),
    ]);

  return (
    <CustomersClient
      initial={customers}
      staff={staff}
      cities={cities.map((o) => o.name)}
      states={states.map((o) => o.name)}
      sectors={sectors.map((o) => o.name)}
      saleExecutives={saleExecutives.map((o) => o.name)}
    />
  );
}
