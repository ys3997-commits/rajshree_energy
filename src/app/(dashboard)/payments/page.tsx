import { listCustomers } from "@/lib/actions/customers";
import { listDiscounts } from "@/lib/actions/discounts";
import { listPayments } from "@/lib/actions/payments";
import { listTransporters } from "@/lib/actions/transporters";
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

  const [customers, transporters] = await Promise.all([
    listCustomers({ activeOnly: true }),
    listTransporters(),
  ]);
  const parties = [
    ...customers.map((c) => ({
      id: c.id,
      name: c.name,
      kind: "customer" as const,
      category: c.category,
    })),
    ...transporters.map((t) => ({
      id: t.id,
      name: t.name,
      kind: "transporter" as const,
    })),
  ];

  if (isDiscount) {
    const discounts = await listDiscounts({ page });
    return <DiscountsClient initial={discounts} parties={parties} />;
  }

  const payments = await listPayments({ page });
  return <PaymentsClient initial={payments} parties={parties} />;
}
