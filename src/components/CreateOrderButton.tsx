"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { CustomerCategory } from "@/generated/prisma";
import { Modal } from "@/components/Modal";
import type { QualityClassOpt } from "@/components/QualityClassSelect";

const NewOrderForm = dynamic(
  () =>
    import("@/components/NewOrderForm").then((m) => ({
      default: m.NewOrderForm,
    })),
  { ssr: false },
);

type CustomerOpt = {
  id: string;
  name: string;
  category: CustomerCategory;
  creditDays: number | null;
};

type Option = { id: string; name: string };

export function CreateOrderButton({
  customers,
  ports,
  qualityClasses,
  suggestedPo,
}: {
  customers: CustomerOpt[];
  ports: Option[];
  qualityClasses: QualityClassOpt[];
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
        New sale order
      </button>
      <Modal
        open={open}
        title="New sale order"
        onClose={() => setOpen(false)}
      >
        {open ? (
          <NewOrderForm
            customers={customers}
            ports={ports}
            qualityClasses={qualityClasses}
            suggestedPo={suggestedPo}
            onCancel={() => setOpen(false)}
          />
        ) : null}
      </Modal>
    </>
  );
}
