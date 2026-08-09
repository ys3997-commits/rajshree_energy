import Link from "next/link";

export function PaymentsTabs({
  active,
}: {
  active: "payment" | "discount";
}) {
  return (
    <div className="ca-tabs" role="tablist" aria-label="Payments sections">
      <Link
        href="/payments"
        role="tab"
        aria-selected={active === "payment"}
        className={
          active === "payment" ? "ca-tab ca-tab-active" : "ca-tab"
        }
        prefetch={false}
      >
        Payment
      </Link>
      <Link
        href="/payments?tab=discount"
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
