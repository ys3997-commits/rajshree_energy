import { describe, expect, it } from "vitest";
import {
  buildCollectionWhatsAppMessage,
  collectionWhatsAppUrl,
  isRajshreeEnergyDealingCompany,
  toWhatsAppPhone,
} from "./collectionWhatsApp";

describe("toWhatsAppPhone", () => {
  it("adds 91 for 10-digit Indian numbers", () => {
    expect(toWhatsAppPhone("98765 43210")).toBe("919876543210");
  });

  it("keeps numbers that already include country code", () => {
    expect(toWhatsAppPhone("+91 98765-43210")).toBe("919876543210");
  });

  it("returns null when contact is missing", () => {
    expect(toWhatsAppPhone(null)).toBeNull();
    expect(toWhatsAppPhone("abc")).toBeNull();
  });
});

describe("isRajshreeEnergyDealingCompany", () => {
  it("matches Rajshree Energy ignoring case and spacing", () => {
    expect(isRajshreeEnergyDealingCompany("Rajshree Energy")).toBe(true);
    expect(isRajshreeEnergyDealingCompany("  rajshree   energy ")).toBe(true);
    expect(isRajshreeEnergyDealingCompany("Other Co")).toBe(false);
    expect(isRajshreeEnergyDealingCompany(null)).toBe(false);
  });
});

describe("buildCollectionWhatsAppMessage", () => {
  it("matches the collection reminder template", () => {
    const msg = buildCollectionWhatsAppMessage({
      paymentInChargeName: "Deepak Bothra",
      due: "881696",
      overdue: "481696",
    });
    expect(msg).toBe(
      [
        "Dear *Sri Deepak Bothra*,",
        "",
        "Your total outstanding amount is *₹8,81,696*. Out of this, *₹4,81,696* is overdue.",
        "",
        "We are requesting you to make program for fund.",
        "",
        "Regards,",
        "*Rajshree Energy*",
      ].join("\n"),
    );
  });
});

describe("collectionWhatsAppUrl", () => {
  it("builds a whatsapp:// link when phone and Rajshree Energy dealing company exist", () => {
    const url = collectionWhatsAppUrl({
      paymentInChargeName: "Ramesh",
      paymentInChargeContact: "9876543210",
      dealingCompany: "Rajshree Energy",
      due: "1000",
      overdue: "500",
    });
    expect(url).toMatch(/^whatsapp:\/\/send\?phone=919876543210&text=/);
  });

  it("returns null without a phone", () => {
    expect(
      collectionWhatsAppUrl({
        paymentInChargeName: "Ramesh",
        paymentInChargeContact: null,
        dealingCompany: "Rajshree Energy",
        due: "1000",
        overdue: "500",
      }),
    ).toBeNull();
  });

  it("returns null when dealing company is not Rajshree Energy", () => {
    expect(
      collectionWhatsAppUrl({
        paymentInChargeName: "Ramesh",
        paymentInChargeContact: "9876543210",
        dealingCompany: "Other Company",
        due: "1000",
        overdue: "500",
      }),
    ).toBeNull();
  });
});
