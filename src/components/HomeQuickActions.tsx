"use client";

import Link from "next/link";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { CreatePurchaseOrderButton } from "@/components/CreatePurchaseOrderButton";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";

type Option = { id: string; name: string };

type OrderOpt = {
  poNumber: string;
  balanceOrder: string | null;
  customer: { name: string } | null;
};

type PurchaseOpt = {
  poNumber: string;
  balanceOrder: string | null;
  importer: { name: string } | null;
  vessel: { vesselName: string } | null;
};

type VesselOpt = {
  id: string;
  vesselName: string;
  importerId: string;
  importer: { name: string } | null;
};

export function HomeQuickActions({
  customers,
  importers,
  staff,
  orders,
  purchaseOrders,
  vessels,
  transporters,
  suggestedPo,
  suggestedPurchasePo,
}: {
  customers: Option[];
  importers: Option[];
  staff: Option[];
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  vessels: VesselOpt[];
  transporters: Option[];
  suggestedPo: string;
  suggestedPurchasePo: string;
}) {
  return (
    <div className="home-quick">
      <CreateOrderButton
        customers={customers}
        staff={staff}
        suggestedPo={suggestedPo}
      />
      <CreatePurchaseOrderButton
        importers={importers}
        vessels={vessels}
        staff={staff}
        suggestedPo={suggestedPurchasePo}
      />
      <CreateDispatchButton
        orders={orders}
        purchaseOrders={purchaseOrders}
        transporters={transporters}
        customers={customers}
        importers={importers}
        vessels={vessels}
        staff={staff}
        suggestedPo={suggestedPo}
        suggestedPurchasePo={suggestedPurchasePo}
      />
      <Link href="/customers" className="btn btn-secondary">
        New customer
      </Link>
      <Link href="/vessels" className="btn btn-secondary">
        New vessel
      </Link>
      <Link href="/transporters" className="btn btn-secondary">
        New transporter
      </Link>
    </div>
  );
}
