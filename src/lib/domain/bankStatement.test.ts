import { describe, expect, it } from "vitest";
import {
  buildBankStatement,
  paymentParticular,
  transferParticular,
} from "./bankStatement";

describe("buildBankStatement", () => {
  it("starts from opening balance and tracks running balance", () => {
    const result = buildBankStatement(1000, [
      {
        id: "1",
        date: "2026-01-02",
        createdAt: "2026-01-02T10:00:00.000Z",
        kind: "payment",
        particular: "Fund received — A",
        debit: 0,
        credit: 500,
      },
      {
        id: "2",
        date: "2026-01-03",
        createdAt: "2026-01-03T10:00:00.000Z",
        kind: "payment",
        particular: "Fund paid — B",
        debit: 200,
        credit: 0,
      },
    ]);

    expect(result.openingBalance).toBe("1000.00");
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]?.balance).toBe("1500.00");
    expect(result.rows[1]?.balance).toBe("1300.00");
    expect(result.closingBalance).toBe("1300.00");
    expect(result.totalCredit).toBe("500.00");
    expect(result.totalDebit).toBe("200.00");
  });

  it("rolls prior movements into opening when dateFrom is set", () => {
    const result = buildBankStatement(
      1000,
      [
        {
          id: "1",
          date: "2026-01-01",
          createdAt: "2026-01-01T10:00:00.000Z",
          kind: "payment",
          particular: "Fund received — A",
          debit: 0,
          credit: 100,
        },
        {
          id: "2",
          date: "2026-01-10",
          createdAt: "2026-01-10T10:00:00.000Z",
          kind: "transfer",
          particular: "Transfer to Cash",
          debit: 50,
          credit: 0,
        },
      ],
      { dateFrom: "2026-01-05" },
    );

    expect(result.openingBalance).toBe("1100.00");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.id).toBe("2");
    expect(result.closingBalance).toBe("1050.00");
  });

  it("excludes movements after dateTo", () => {
    const result = buildBankStatement(
      0,
      [
        {
          id: "1",
          date: "2026-02-01",
          createdAt: "2026-02-01T10:00:00.000Z",
          kind: "payment",
          particular: "Fund received — A",
          debit: 0,
          credit: 10,
        },
        {
          id: "2",
          date: "2026-03-01",
          createdAt: "2026-03-01T10:00:00.000Z",
          kind: "payment",
          particular: "Fund received — B",
          debit: 0,
          credit: 20,
        },
      ],
      { dateTo: "2026-02-15" },
    );

    expect(result.rows).toHaveLength(1);
    expect(result.closingBalance).toBe("10.00");
  });
});

describe("particulars", () => {
  it("labels payments and transfers", () => {
    expect(paymentParticular("RECEIVED", "Acme")).toBe("Fund received — Acme");
    expect(paymentParticular("SENT", "Acme")).toBe("Fund paid — Acme");
    expect(transferParticular("paid", "Cash")).toBe("Transfer to Cash");
    expect(transferParticular("received", "Cash")).toBe("Transfer from Cash");
  });
});
