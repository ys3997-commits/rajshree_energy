import { listIndustryCustomers, listVegs } from "@/lib/actions/veg";
import { VegClient } from "./VegClient";

export default async function VegPage() {
  const [rows, customers] = await Promise.all([
    listVegs(),
    listIndustryCustomers(),
  ]);

  return <VegClient initial={rows} customers={customers} />;
}
