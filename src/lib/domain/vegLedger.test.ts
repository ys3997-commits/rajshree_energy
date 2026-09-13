import { describe, expect, it } from "vitest";
import { VegPaymentBasis } from "@/generated/prisma";
import {
  formatMonthLabel,
  monthKeyFromIsoDate,
  paymentBasisLabel,
  vegPayableAmount,
} from "./vegLedger";

describe("veg ledger month helpers", () => {
  it("reads YYYY-MM from an ISO date", () => {
    expect(monthKeyFromIsoDate("2026-09-13")).toBe("2026-09");
  });

  it("formats Sep 2026", () => {
    expect(formatMonthLabel("2026-09")).toBe("Sep 2026");
  });
});

describe("vegPayableAmount", () => {
  it("multiplies quantity by rate for Per MT", () => {
    expect(
      vegPayableAmount({
        paymentBasis: VegPaymentBasis.PER_MT,
        quantity: "12.5",
        trucks: 3,
        rate: "100",
      }),
    ).toBe("1250");
  });

  it("multiplies trucks by rate for Per Lorry", () => {
    expect(
      vegPayableAmount({
        paymentBasis: VegPaymentBasis.PER_LORRY,
        quantity: "12.5",
        trucks: 3,
        rate: "500",
      }),
    ).toBe("1500");
  });
});

describe("paymentBasisLabel", () => {
  it("labels both bases", () => {
    expect(paymentBasisLabel(VegPaymentBasis.PER_MT)).toBe("Per MT");
    expect(paymentBasisLabel(VegPaymentBasis.PER_LORRY)).toBe("Per Lorry");
  });
});
