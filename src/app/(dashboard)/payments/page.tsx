import { listCustomers, listCustomersWithDue } from "@/lib/actions/customers";
import { listPayments } from "@/lib/actions/payments";
import { PaymentsClient } from "./PaymentsClient";

type SearchParams = Promise<{ page?: string; tab?: string }>;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const tab =
    sp.tab === "collection"
      ? "collection"
      : sp.tab === "vendor-collection"
        ? "vendor-collection"
        : "transactions";

  const [payments, customers, collection] = await Promise.all([
    listPayments({ page }),
    listCustomers({ activeOnly: true }),
    listCustomersWithDue(),
  ]);

  return (
    <PaymentsClient
      initial={payments}
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
      collection={collection}
      initialTab={tab}
    />
  );
}
