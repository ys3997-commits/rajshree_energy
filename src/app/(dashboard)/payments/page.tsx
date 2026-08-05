import { listCustomers } from "@/lib/actions/customers";
import { listPayments } from "@/lib/actions/payments";
import { redirect } from "next/navigation";
import { PaymentsClient } from "./PaymentsClient";

type SearchParams = Promise<{ page?: string; tab?: string }>;

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

  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);

  const [payments, customers] = await Promise.all([
    listPayments({ page }),
    listCustomers({ activeOnly: true }),
  ]);

  return (
    <PaymentsClient
      initial={payments}
      customers={customers.map((c) => ({ id: c.id, name: c.name }))}
    />
  );
}
