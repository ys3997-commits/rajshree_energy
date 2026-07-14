import { listCustomers } from "@/lib/actions/customers";
import { listStaff } from "@/lib/actions/staff";
import { CustomersClient } from "./CustomersClient";

export default async function CustomersPage() {
  const [customers, staff] = await Promise.all([listCustomers(), listStaff()]);
  return <CustomersClient initial={customers} staff={staff} />;
}
