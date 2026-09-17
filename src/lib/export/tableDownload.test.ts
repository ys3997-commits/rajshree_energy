import { describe, expect, it } from "vitest";
import {
  buildCsv,
  exportPdfHeader,
  exportWrappedHeader,
  toTitleCaseHeader,
} from "./tableDownload";

describe("toTitleCaseHeader", () => {
  it("capitalizes each word and keeps PO as an acronym", () => {
    expect(toTitleCaseHeader("PO number")).toBe("PO Number");
    expect(toTitleCaseHeader("Order qty")).toBe("Order Qty");
    expect(toTitleCaseHeader("Dispatched qty")).toBe("Dispatched Qty");
    expect(toTitleCaseHeader("Quality class")).toBe("Quality Class");
    expect(toTitleCaseHeader("Freight PMT")).toBe("Freight PMT");
  });

  it("removes commas from headers", () => {
    expect(toTitleCaseHeader("Quality, class")).toBe("Quality Class");
    expect(toTitleCaseHeader("Order, Qty")).toBe("Order Qty");
  });
});

describe("exportPdfHeader", () => {
  it("restores wrap points after title-casing", () => {
    expect(exportPdfHeader("Trucks\ndispatch")).toEqual([
      "Trucks",
      "Dispatch",
    ]);
    expect(exportPdfHeader("Number of\nlorries")).toEqual([
      "Number Of",
      "Lorries",
    ]);
    expect(exportPdfHeader("Order Qty")).toBe("Order Qty");
    expect(exportPdfHeader("Freight\nPMT")).toEqual(["Freight", "PMT"]);
  });
});

describe("buildCsv", () => {
  it("writes title-case headers without commas inside header labels", () => {
    const csv = buildCsv(
      [
        { key: "poNumber", header: "PO Number" },
        { key: "orderQty", header: "Order, Qty" },
        { key: "trucks", header: "Trucks\ndispatch" },
      ],
      [{ poNumber: "SO-1", orderQty: "12.50 MT", trucks: "3" }],
    );
    expect(csv).toBe('PO Number,Order Qty,"Trucks\nDispatch"\nSO-1,12.50 MT,3');
    expect(exportWrappedHeader("Order, Qty")).toBe("Order Qty");
  });

  it("does not pad cells to a fixed width", () => {
    const csv = buildCsv(
      [
        { key: "a", header: "Date" },
        { key: "b", header: "Customer" },
      ],
      [
        { a: "1", b: "Alaknanda Steel" },
        { a: "12/09/2026", b: "X" },
      ],
    );
    expect(csv).toBe("Date,Customer\n1,Alaknanda Steel\n12/09/2026,X");
  });
});
