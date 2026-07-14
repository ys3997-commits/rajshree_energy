"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { NewOrderForm } from "@/components/NewOrderForm";

type Option = { id: string; name: string };

export function CreateOrderButton({
  customers,
  staff,
  suggestedPo,
}: {
  customers: Option[];
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
        New order
      </button>
      <Modal
        open={open}
        title="New regular order"
        onClose={() => setOpen(false)}
      >
        <NewOrderForm
          customers={customers}
          staff={staff}
          suggestedPo={suggestedPo}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
