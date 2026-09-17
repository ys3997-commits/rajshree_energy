"use client";

import { useRef, type ReactNode } from "react";
import { UpdateTableInteraction } from "@/components/UpdateTableInteraction";
import { useTableColumnResize } from "@/components/useTableColumnResize";

export function ResizableDataTable({
  canResize,
  storageKey,
  columnCount,
  tableClassName,
  children,
}: {
  canResize: boolean;
  storageKey: string;
  columnCount: number;
  tableClassName: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { widths, guideX, tableWidth } = useTableColumnResize({
    containerRef: wrapRef,
    enabled: canResize,
    storageKey,
    columnCount,
  });
  const className = [
    tableClassName,
    widths ? "report-table-resizable" : "",
    canResize && widths ? "report-table-owner-resize" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="table-h-scroll" ref={wrapRef}>
      {guideX != null ? (
        <div className="col-resize-guide" style={{ left: guideX }} />
      ) : null}
      <UpdateTableInteraction
        className={className}
        style={tableWidth ? { width: tableWidth } : undefined}
      >
        {widths ? (
          <colgroup>
            {widths.map((width, index) => (
              <col key={index} style={{ width }} />
            ))}
          </colgroup>
        ) : null}
        {children}
      </UpdateTableInteraction>
    </div>
  );
}
