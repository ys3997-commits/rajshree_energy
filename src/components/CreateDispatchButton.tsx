"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { NewDispatchForm } from "@/components/NewDispatchForm";

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

type Opt = { id: string; name: string };

type VesselOpt = {
  id: string;
  vesselName: string;
};

export function CreateDispatchButton({
  orders,
  purchaseOrders,
  transporters,
  customers,
  importers,
  vessels,
  staff,
  suggestedPo,
  suggestedPurchasePo,
}: {
  orders: OrderOpt[];
  purchaseOrders: PurchaseOpt[];
  transporters: Opt[];
  customers: Opt[];
  importers: Opt[];
  vessels: VesselOpt[];
  staff: Opt[];
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
          importers={importers}
          vessels={vessels}
          staff={staff}
          suggestedPo={suggestedPo}
          suggestedPurchasePo={suggestedPurchasePo}
          onCancel={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
