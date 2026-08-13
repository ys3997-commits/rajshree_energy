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

  it("rejects both or neither", () => {
    expect(() => parsePaymentParty({})).toThrow(
      "Customer or transporter is required",
    );
    expect(() =>
      parsePaymentParty({ customerId: "c1", transporterId: "t1" }),
    ).toThrow("Select a customer or a transporter, not both");
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
  });
});
