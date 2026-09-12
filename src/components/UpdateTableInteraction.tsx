"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

const ROW_HOLD_MS = 35_000;
const HOLD_TABLE_CLASS = "update-table-hold-active";
const HOLD_ROW_CLASS = "update-table-row-held";

export function UpdateTableInteraction({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  const tableRef = useRef<HTMLTableElement>(null);
  const heldRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);

  function clearHold(row: HTMLElement) {
    row.classList.remove(HOLD_ROW_CLASS);
    if (heldRef.current === row) {
      heldRef.current = null;
      tableRef.current?.classList.remove(HOLD_TABLE_CLASS);
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current);
    };
  }, []);

  function onDoubleClick(event: MouseEvent<HTMLTableElement>) {
    const row = (event.target as HTMLElement | null)?.closest(
      "tbody tr[data-dispatch-id]",
    );
    if (!(row instanceof HTMLElement)) return;

    window.getSelection()?.removeAllRanges();

    if (heldRef.current && heldRef.current !== row) {
      heldRef.current.classList.remove(HOLD_ROW_CLASS);
    }

    row.classList.add(HOLD_ROW_CLASS);
    heldRef.current = row;
    event.currentTarget.classList.add(HOLD_TABLE_CLASS);

    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      clearHold(row);
      timerRef.current = null;
    }, ROW_HOLD_MS);
  }

  return (
    <table
      ref={tableRef}
      className={className}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </table>
  );
}
