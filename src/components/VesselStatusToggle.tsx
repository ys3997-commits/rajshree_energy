"use client";

import { useState, useTransition } from "react";
import { updateVesselActive } from "@/lib/actions/vessels";

export function VesselStatusToggle({
  vesselId,
  active: initialActive,
  onChange,
  onError,
}: {
  vesselId: string;
  active: boolean;
  onChange?: (active: boolean) => void;
  onError?: (message: string) => void;
}) {
  const [active, setActive] = useState(initialActive);
  const [prevInitialActive, setPrevInitialActive] = useState(initialActive);
  const [pending, startTransition] = useTransition();

  if (initialActive !== prevInitialActive) {
    setPrevInitialActive(initialActive);
    setActive(initialActive);
  }

  function setStatus(next: boolean) {
    if (next === active || pending) return;
    const prev = active;
    setActive(next);
    startTransition(async () => {
      try {
        await updateVesselActive(vesselId, next);
        onChange?.(next);
      } catch (err) {
        setActive(prev);
        onError?.(
          err instanceof Error ? err.message : "Could not update status",
        );
      }
    });
  }

  return (
    <div
      className={`status-toggle${pending ? " status-toggle-pending" : ""}`}
      role="radiogroup"
      aria-label="Vessel status"
    >
      <button
        type="button"
        role="radio"
        aria-checked={active}
        disabled={pending}
        className={`status-toggle-option status-toggle-option-active${active ? " status-toggle-option-selected" : ""}`}
        onClick={() => setStatus(true)}
      >
        Active
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={!active}
        disabled={pending}
        className={`status-toggle-option status-toggle-option-inactive${!active ? " status-toggle-option-selected" : ""}`}
        onClick={() => setStatus(false)}
      >
        Inactive
      </button>
    </div>
  );
}
