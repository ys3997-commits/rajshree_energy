export type Access =
  | { kind: "owner"; name: string; pageKeys: "all" }
  | {
      kind: "staff";
      id: string;
      name: string;
      pageKeys: string[];
      collectionSalesExecs: string[];
      salesEngineSalesExecs: string[];
      saleOrderSalesExecs: string[];
      purchaseOrderSalesExecs: string[];
      ageingReportSalesExecs: string[];
    }
  | { kind: "none" };
