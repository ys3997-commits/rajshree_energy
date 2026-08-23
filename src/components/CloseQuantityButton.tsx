"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { closeOrderQuantity } from "@/lib/actions/orders";
import { closePurchaseOrderQuantity } from "@/lib/actions/purchaseOrders";
import { formatMt } from "@/lib/domain/format";

export function CloseQuantityButton({
  orderId,
  kind,
  balanceMt,
}: {
  orderId: string;
  kind: "sale" | "purchase";
  balanceMt: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (
      !confirm(
        `Close remaining balance of ${formatMt(balanceMt)}? This sets closing quantity to ${formatMt(balanceMt)} and balance to 0.`,
      )
    ) {
      return;
    }
    setPending(true);
    try {
      if (kind === "sale") {
        await closeOrderQuantity(orderId);
      } else {
        await closePurchaseOrderQuantity(orderId);
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Close failed");
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-secondary btn-sm"
      disabled={pending}
      onClick={onClick}
    >
      {pending ? "Closing…" : "Close"}
    </button>
  );
}
