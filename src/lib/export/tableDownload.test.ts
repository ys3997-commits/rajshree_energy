import { describe, expect, it } from "vitest";
import { buildExcelWorkbook } from "./excelWorkbook";
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
  it("joins wrapped words with a space", () => {
    expect(exportPdfHeader("Trucks\ndispatch")).toBe("Trucks Dispatch");
    expect(exportPdfHeader("Number of\nlorries")).toBe("Number Of Lorries");
    expect(exportPdfHeader("Order Qty")).toBe("Order Qty");
    expect(exportPdfHeader("Lorry\nNo")).toBe("Lorry No");
    expect(exportPdfHeader("Freight\nPMT")).toBe("Freight PMT");
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

describe("buildExcelWorkbook", () => {
  it("writes an xlsx zip with escaped cell text", () => {
    const bytes = buildExcelWorkbook(
      [
        { key: "vendor", header: "Vendor" },
        { key: "amount", header: "Amount" },
      ],
      [{ vendor: "A & B <Co>", amount: "1,200" }],
      "Tally Entry",
    );
    const text = new TextDecoder().decode(bytes);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(text).toContain('name="Tally Entry"');
    expect(text).toContain("A &amp; B &lt;Co&gt;");
    expect(text).toContain(">Vendor<");
    expect(text).toContain(">1,200<");
    expect(text).toContain('<c r="A1" s="1"');
    expect(text).not.toContain('<c r="A2" s="1"');
  });

  it("writes a second table two rows below the first", () => {
    const bytes = buildExcelWorkbook(
      [{ key: "vendor", header: "Vendor" }],
      [{ vendor: "A" }],
      "Tally Entry",
      [
        {
          columns: [
            { key: "quality", header: "Quality" },
            { key: "lorries", header: "Total no of lorries" },
          ],
          rows: [{ quality: "ROM", lorries: "6 Lorry" }],
        },
      ],
    );
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('<row r="1">');
    expect(text).toContain('<row r="2">');
    expect(text).toContain('<row r="5">');
    expect(text).not.toContain('<row r="3">');
    expect(text).not.toContain('<row r="4">');
    expect(text).toContain(">Total No Of Lorries<");
    expect(text).toContain(">6 Lorry<");
    expect(text).toContain('<c r="A5" s="1"');
    expect(text).not.toContain('<c r="A6" s="1"');
  });

  it("bolds a total row", () => {
    const bytes = buildExcelWorkbook(
      [
        { key: "date", header: "Date" },
        { key: "amount", header: "Amount" },
      ],
      [
        { date: "24/10/2026", amount: "100" },
        { date: "Total", amount: "100" },
      ],
    );
    const text = new TextDecoder().decode(bytes);
    expect(text).toContain('<c r="A3" s="1"');
    expect(text).toContain('<c r="B3" s="1"');
    expect(text).not.toContain('<c r="A2" s="1"');
    expect(text).toContain("<b/>");
  });
});
