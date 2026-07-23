"use client";

import Link from "next/link";
import { CustomerCategory } from "@/generated/prisma";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { CreatePurchaseOrderButton } from "@/components/CreatePurchaseOrderButton";
import { CreateDispatchButton } from "@/components/CreateDispatchButton";
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
  staff,
  ports,
  orders,
  purchaseOrders,
  vessels,
  transporters,
  qualityClasses,
  suggestedPo,
  suggestedPurchasePo,
}: {
  customers: CustomerOpt[];
  importers: Option[];
  staff: Option[];
  ports: Option[];
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  vessels: VesselOpt[];
  transporters: Option[];
  qualityClasses: QualityClassOpt[];
  suggestedPo: string;
  suggestedPurchasePo: string;
}) {
  return (
    <div className="home-quick">
      <CreateOrderButton
        customers={customers}
        ports={ports}
        qualityClasses={qualityClasses}
        suggestedPo={suggestedPo}
      />
      <CreatePurchaseOrderButton
        importers={importers}
        vessels={vessels}
        suggestedPo={suggestedPurchasePo}
      />
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
      <Link href="/qualities" className="btn btn-secondary">
        Qualities
      </Link>
      <Link href="/transporters" className="btn btn-secondary">
        New transporter
      </Link>
    </div>
  );
}
