import type { ReactNode } from "react";

type TableWrapProps = {
  children: ReactNode;
  className?: string;
};

export function TableWrap({ children, className }: TableWrapProps) {
  return (
    <div className={className ? `table-wrap ${className}` : "table-wrap"}>
      <div className="table-h-scroll">{children}</div>
    </div>
  );
}
