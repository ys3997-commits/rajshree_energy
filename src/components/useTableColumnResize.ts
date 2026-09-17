"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const MIN_WIDTH = 48;
const MAX_WIDTH = 640;
const EDGE_PX = 10;
const STORAGE_PREFIX = "rajshree.table.columnWidths.";

function clampWidth(value: number): number {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, Math.round(value)));
}

function readStored(storageKey: string, columnCount: number): number[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== columnCount) return null;
    return parsed.map((value) =>
      typeof value === "number" && Number.isFinite(value)
        ? clampWidth(value)
        : MIN_WIDTH,
    );
  } catch {
    return null;
  }
}

function persist(storageKey: string, widths: number[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(widths));
  } catch {
    /* ignore quota / private mode */
  }
}

function headerCellFromEvent(event: Event): HTMLTableCellElement | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const th = target.closest("thead tr:not(.report-group-row) > th");
  return th instanceof HTMLTableCellElement ? th : null;
}

function nearRightEdge(th: HTMLTableCellElement, clientX: number): boolean {
  const rect = th.getBoundingClientRect();
  return clientX >= rect.right - EDGE_PX && clientX <= rect.right + 4;
}

function measureColumnWidths(
  table: HTMLTableElement,
  columnCount: number,
): number[] {
  const headers = table.querySelectorAll("thead tr:not(.report-group-row) > th");
  if (headers.length !== columnCount) {
    return Array.from({ length: columnCount }, () => 96);
  }
  return Array.from(headers, (th) =>
    clampWidth(th.getBoundingClientRect().width),
  );
}

export function useTableColumnResize({
  containerRef,
  enabled,
  storageKey,
  columnCount,
}: {
  containerRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  storageKey: string;
  columnCount: number;
}) {
  const [widths, setWidths] = useState<number[] | null>(null);
  const [guideX, setGuideX] = useState<number | null>(null);
  const widthsRef = useRef<number[] | null>(null);
  widthsRef.current = widths;

  useLayoutEffect(() => {
    const table = containerRef.current?.querySelector("table");
    if (!(table instanceof HTMLTableElement)) return;
    const stored = readStored(storageKey, columnCount);
    const next = stored ?? measureColumnWidths(table, columnCount);
    widthsRef.current = next;
    setWidths(next);
  }, [columnCount, containerRef, storageKey]);

  useLayoutEffect(() => {
    if (!enabled) return;
    const table = containerRef.current?.querySelector("table");
    if (!(table instanceof HTMLTableElement)) return;

    let drag: {
      index: number;
      startX: number;
      startWidth: number;
    } | null = null;

    function stopDrag() {
      if (!drag) return;
      drag = null;
      setGuideX(null);
      document.body.classList.remove("col-resizing");
      document.body.style.cursor = "";
      table.style.cursor = "";
      const current = widthsRef.current;
      if (current) persist(storageKey, current);
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      const th = headerCellFromEvent(event);
      if (!th || !nearRightEdge(th, event.clientX)) return;
      const current = widthsRef.current;
      if (!current) return;
      event.preventDefault();
      event.stopPropagation();
      drag = {
        index: th.cellIndex,
        startX: event.clientX,
        startWidth: current[th.cellIndex] ?? th.getBoundingClientRect().width,
      };
      setGuideX(event.clientX);
      document.body.classList.add("col-resizing");
      document.body.style.cursor = "col-resize";
      table.style.cursor = "col-resize";
    }

    function onPointerMove(event: PointerEvent) {
      if (drag) {
        const nextWidth = clampWidth(
          drag.startWidth + (event.clientX - drag.startX),
        );
        const current = widthsRef.current;
        if (!current || current[drag.index] === nextWidth) {
          setGuideX(event.clientX);
          return;
        }
        const next = [...current];
        next[drag.index] = nextWidth;
        widthsRef.current = next;
        setWidths(next);
        setGuideX(event.clientX);
        return;
      }
      const th = headerCellFromEvent(event);
      table.style.cursor =
        th && nearRightEdge(th, event.clientX) ? "col-resize" : "";
    }

    function onPointerUp() {
      stopDrag();
    }

    function onDoubleClick(event: MouseEvent) {
      const th = headerCellFromEvent(event);
      if (!th || !nearRightEdge(th, event.clientX)) return;
      event.preventDefault();
      event.stopPropagation();
      const fitted = clampWidth(th.scrollWidth + 16);
      const current = widthsRef.current;
      if (!current) return;
      const next = [...current];
      next[th.cellIndex] = fitted;
      widthsRef.current = next;
      setWidths(next);
      persist(storageKey, next);
    }

    table.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    table.addEventListener("dblclick", onDoubleClick, true);
    return () => {
      stopDrag();
      table.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      table.removeEventListener("dblclick", onDoubleClick, true);
    };
  }, [columnCount, containerRef, enabled, storageKey]);

  return {
    widths,
    guideX,
    tableWidth: widths?.reduce((sum, width) => sum + width, 0) ?? undefined,
  };
}
