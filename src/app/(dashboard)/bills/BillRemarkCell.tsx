"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { remarkFirstLine, remarkIsExpandable } from "@/lib/domain/bills";

export function BillRemarkCell({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const trimmed = text.trim();

  if (!trimmed) return <>—</>;

  const preview = remarkFirstLine(trimmed);
  const expandable = remarkIsExpandable(trimmed);

  if (!expandable) {
    return <>{preview}</>;
  }

  return (
    <>
      <button
        type="button"
        className="bill-remark-preview"
        aria-haspopup="dialog"
        aria-label={`View full ${title.toLowerCase()}`}
        title={preview}
        onClick={() => setOpen(true)}
      >
        {preview}
      </button>
      <Modal open={open} title={title} onClose={() => setOpen(false)}>
        <p className="bill-remark-full">{trimmed}</p>
      </Modal>
    </>
  );
}
