import { listCustomers } from "@/lib/actions/customers";
import { listDiscounts } from "@/lib/actions/discounts";
import { listPayments } from "@/lib/actions/payments";
import { redirect } from "next/navigation";
import { DiscountsClient } from "./DiscountsClient";
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
  const isDiscount = sp.tab === "discount";

  const customersPromise = listCustomers({ activeOnly: true });

  if (isDiscount) {
    const [discounts, customers] = await Promise.all([
      listDiscounts({ page }),
      customersPromise,
    ]);

    return (
      <DiscountsClient
        initial={discounts}
        customers={customers.map((c) => ({
          id: c.id,
          name: c.name,
          category: c.category,
        }))}
      />
    );
  }

  const [payments, customers] = await Promise.all([
    listPayments({ page }),
    customersPromise,
  ]);

  return (
    <PaymentsClient
      initial={payments}
      customers={customers.map((c) => ({
        id: c.id,
        name: c.name,
        category: c.category,
      }))}
    />
  );
}
