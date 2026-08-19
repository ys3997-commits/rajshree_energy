"use client";

import { CustomerCategory } from "@/generated/prisma";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { CreatePurchaseOrderButton } from "@/components/CreatePurchaseOrderButton";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
import { LockedLink } from "@/components/LockedLink";
import type { QualityClassOpt } from "@/components/QualityClassSelect";
import type { QualityClassLabel } from "@/lib/domain/format";

type Option = { id: string; name: string };

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
  creditDays: number | null;
};

type OrderOpt = {
  poNumber: string;
  balanceOrder: string | null;
  rate: string | null;
  customer: { name: string; category: CustomerCategory } | null;
};

type PurchaseOpt = {
  poNumber: string;
  balanceOrder: string | null;
  rate: string | null;
  importer: { name: string } | null;
  vessel: { vesselName: string } | null;
  qualityClass: QualityClassLabel | null;
};

type VesselOpt = {
  id: string;
  vesselName: string;
  qualityClassId: string | null;
  qualityClass: QualityClassLabel | null;
  port: { id: string; name: string } | null;
};

export function HomeQuickActions({
  customers,
  importers,
  ports,
  orders,
  purchaseOrders,
  vessels,
  transporters,
  qualityClasses,
  suggestedPo,
  suggestedPurchasePo,
  suggestedDispatchNumber,
  allowed,
}: {
  customers: CustomerOpt[];
  importers: Option[];
  ports: Option[];
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  vessels: VesselOpt[];
  transporters: Option[];
  qualityClasses: QualityClassOpt[];
  suggestedPo: string;
  suggestedPurchasePo: string;
  suggestedDispatchNumber: string;
  allowed: {
    orders: boolean;
    purchaseOrders: boolean;
    dispatches: boolean;
    customers: boolean;
    vessels: boolean;
    qualities: boolean;
    transporters: boolean;
  };
}) {
  return (
    <div className="home-quick">
      <div className={allowed.orders ? undefined : "is-locked-control"}>
        <CreateOrderButton
          customers={customers}
          ports={ports}
          qualityClasses={qualityClasses}
          suggestedPo={suggestedPo}
        />
      </div>
      <div className={allowed.purchaseOrders ? undefined : "is-locked-control"}>
        <CreatePurchaseOrderButton
          importers={importers}
          vessels={vessels}
          suggestedPo={suggestedPurchasePo}
        />
      </div>
      <div className={allowed.dispatches ? undefined : "is-locked-control"}>
        <CreateDispatchButton
          orders={orders}
          purchaseOrders={purchaseOrders}
          transporters={transporters}
          customers={customers.map((c) => ({
            id: c.id,
            name: c.name,
            category: c.category,
          }))}
          vessels={vessels}
          suggestedPo={suggestedPo}
          suggestedPurchasePo={suggestedPurchasePo}
          suggestedDispatchNumber={suggestedDispatchNumber}
        />
      </div>
      <LockedLink
        href="/customers"
        allowed={allowed.customers}
        className="btn btn-secondary"
      >
        New customer
      </LockedLink>
      <LockedLink
        href="/vessels"
        allowed={allowed.vessels}
        className="btn btn-secondary"
      >
        New vessel
      </LockedLink>
      <LockedLink
        href="/qualities"
        allowed={allowed.qualities}
        className="btn btn-secondary"
      >
        Qualities
      </LockedLink>
      <LockedLink
        href="/transporters"
        allowed={allowed.transporters}
        className="btn btn-secondary"
      >
        New transporter
      </LockedLink>
    </div>
  );
}
