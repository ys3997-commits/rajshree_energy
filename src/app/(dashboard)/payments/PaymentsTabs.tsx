import Link from "next/link";
import { paymentsHref } from "./paymentsHref";

export function PaymentsTabs({
  active,
  dateFrom = "",
  dateTo = "",
  party = "",
  type = "",
}: {
  active: "payment" | "discount";
  dateFrom?: string;
  dateTo?: string;
  party?: string;
  type?: string;
}) {
  const filters = { dateFrom, dateTo, party, type };
  return (
    <div className="ca-tabs" role="tablist" aria-label="Fund Flow sections">
      <Link
        href={paymentsHref({ tab: "payment", ...filters })}
        role="tab"
        aria-selected={active === "payment"}
        className={
          active === "payment" ? "ca-tab ca-tab-active" : "ca-tab"
        }
        prefetch={false}
      >
        Transactions
      </Link>
      <Link
        href={paymentsHref({ tab: "discount", ...filters })}
        role="tab"
        aria-selected={active === "discount"}
        className={
          active === "discount" ? "ca-tab ca-tab-active" : "ca-tab"
        }
        prefetch={false}
      >
        Discount
      </Link>
    </div>
  );
}
