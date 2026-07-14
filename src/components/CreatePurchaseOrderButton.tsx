"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { NewPurchaseOrderForm } from "@/components/NewPurchaseOrderForm";

type Option = { id: string; name: string };

type VesselOpt = {
  id: string;
  vesselName: string;
  importerId: string;
  importer: { name: string } | null;
};

export function CreatePurchaseOrderButton({
  importers,
  vessels,
  staff,
  suggestedPo,
}: {
  importers: Option[];
  vessels: VesselOpt[];
  staff: Option[];
  suggestedPo: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setOpen(true)}
      >
        New purchase order
      </button>
      <Modal
        open={open}
        title="New purchase order"
        onClose={() => setOpen(false)}
      >
        <NewPurchaseOrderForm
          importers={importers}
          vessels={vessels}
          staff={staff}
          suggestedPo={suggestedPo}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
