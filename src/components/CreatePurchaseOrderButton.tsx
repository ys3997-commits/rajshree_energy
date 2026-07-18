"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { NewPurchaseOrderForm } from "@/components/NewPurchaseOrderForm";
import type { QualityClassLabel } from "@/lib/domain/format";

type Option = { id: string; name: string };

type VesselOpt = {
  id: string;
  vesselName: string;
  qualityClassId: string | null;
  qualityClass: QualityClassLabel | null;
  port: { id: string; name: string } | null;
};

export function CreatePurchaseOrderButton({
  importers,
  vessels,
  suggestedPo,
}: {
  importers: Option[];
  vessels: VesselOpt[];
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
          suggestedPo={suggestedPo}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
