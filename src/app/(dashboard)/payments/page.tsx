import { listCustomers } from "@/lib/actions/customers";
import { listDiscounts } from "@/lib/actions/discounts";
import { listPayments } from "@/lib/actions/payments";
import { listTransporters } from "@/lib/actions/transporters";
import { redirect } from "next/navigation";
import { DiscountsClient } from "./DiscountsClient";
import { PaymentsClient } from "./PaymentsClient";
import { parseFundFlowType } from "./paymentsHref";

type SearchParams = Promise<{
  page?: string;
  tab?: string;
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}>;

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
  const dateFrom = sp.dateFrom?.trim() || "";
  const dateTo = sp.dateTo?.trim() || "";
  const party = sp.party?.trim() || "";
  const type = parseFundFlowType(sp.type);
  const isDiscount = sp.tab === "discount";
  const listFilter = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    party: party || undefined,
    type: type || undefined,
  };

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
    const [discounts, exportDiscounts] = await Promise.all([
      listDiscounts({ page, ...listFilter }),
      listDiscounts({ all: true, ...listFilter }),
    ]);
    return (
      <DiscountsClient
        initial={discounts}
        exportRows={exportDiscounts.rows}
        parties={parties}
        dateFrom={dateFrom}
        dateTo={dateTo}
        party={party}
        type={type}
      />
    );
  }

  const [payments, exportPayments] = await Promise.all([
    listPayments({ page, ...listFilter }),
    listPayments({ all: true, ...listFilter }),
  ]);
  return (
    <PaymentsClient
      initial={payments}
      exportRows={exportPayments.rows}
      parties={parties}
      dateFrom={dateFrom}
      dateTo={dateTo}
      party={party}
      type={type}
    />
  );
}
