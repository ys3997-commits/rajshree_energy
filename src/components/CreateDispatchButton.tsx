"use client";

import { useState } from "react";
import { CustomerCategory } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import { NewDispatchForm } from "@/components/NewDispatchForm";

type OrderOpt = {
  poNumber: string;
  balanceOrder: string | null;
  rate: string | null;
  customer: { name: string; category: CustomerCategory } | null;
};

type QualityClassOpt = {
  domestic: boolean;
  origin: { name: string };
  qualityOption: { name: string };
};

type PurchaseOpt = {
  poNumber: string;
  balanceOrder: string | null;
  rate: string | null;
  importer: { name: string } | null;
  vessel: { vesselName: string } | null;
  qualityClass: QualityClassOpt | null;
};

type Opt = { id: string; name: string };

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
};

type VesselOpt = {
  id: string;
  vesselName: string;
};

export function CreateDispatchButton({
  orders,
  purchaseOrders,
  transporters,
  customers,
  vessels,
  suggestedPo,
  suggestedPurchasePo,
}: {
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  transporters: Opt[];
  customers: CustomerOpt[];
  vessels: VesselOpt[];
  suggestedPo: string;
  suggestedPurchasePo: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)}>
        New dispatch
      </button>
      <Modal
        open={open}
        title="New dispatch"
        onClose={() => setOpen(false)}
        wide
      >
        <NewDispatchForm
          orders={orders}
          purchaseOrders={purchaseOrders}
          transporters={transporters}
          customers={customers}
          vessels={vessels}
          suggestedPo={suggestedPo}
          suggestedPurchasePo={suggestedPurchasePo}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
