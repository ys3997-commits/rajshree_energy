"use client";

import { useEffect, useState, useTransition } from "react";
import { updateDispatch } from "@/lib/actions/dispatch";

type Field = "softCopyStatus" | "entryInTally";

export function DispatchBoolToggle({
  dispatchId,
  field,
  value,
}: {
  dispatchId: string;
  field: Field;
  value: boolean;
}) {
  const [checked, setChecked] = useState(value);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setChecked(value);
  }, [value]);

  function onChange(next: boolean) {
    const prev = checked;
    setChecked(next);
    startTransition(async () => {
      try {
        await updateDispatch(dispatchId, { [field]: next });
      } catch {
        setChecked(prev);
      }
    });
  }

  return (
    <input
      type="checkbox"
      className="dispatch-bool-toggle"
      checked={checked}
      disabled={pending}
      onChange={(e) => onChange(e.target.checked)}
      aria-label={field === "softCopyStatus" ? "Soft copy" : "Entry in Tally"}
    />
  );
}
