import { describe, expect, it } from "vitest";
import {
  parsePartyKey,
  parsePaymentParty,
  partyKey,
} from "./paymentParty";

describe("parsePaymentParty", () => {
  it("accepts a customer id", () => {
    expect(parsePaymentParty({ customerId: "c1" })).toEqual({
      kind: "customer",
      id: "c1",
    });
  });

  it("accepts a transporter id", () => {
    expect(parsePaymentParty({ transporterId: "t1" })).toEqual({
      kind: "transporter",
      id: "t1",
    });
  });

  it("accepts an investment company id", () => {
    expect(parsePaymentParty({ investmentCompanyId: "i1" })).toEqual({
      kind: "investment",
      id: "i1",
    });
  });

  it("rejects both or neither", () => {
    expect(() => parsePaymentParty({})).toThrow(
      "Customer, transporter, or investment company is required",
    );
    expect(() =>
      parsePaymentParty({ customerId: "c1", transporterId: "t1" }),
    ).toThrow("Select only one party");
  });
});

describe("partyKey", () => {
  it("round-trips through parsePartyKey", () => {
    expect(parsePartyKey(partyKey("customer", "abc"))).toEqual({
      kind: "customer",
      id: "abc",
    });
    expect(parsePartyKey(partyKey("transporter", "xyz"))).toEqual({
      kind: "transporter",
      id: "xyz",
    });
    expect(parsePartyKey(partyKey("investment", "inv1"))).toEqual({
      kind: "investment",
      id: "inv1",
    });
  });
});
