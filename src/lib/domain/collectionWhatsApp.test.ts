import { describe, expect, it } from "vitest";
import {
  buildCollectionWhatsAppMessage,
  collectionWhatsAppDisabledReason,
  collectionWhatsAppLinks,
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
      recipientName: "Deepak Bothra",
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

describe("collectionWhatsAppDisabledReason", () => {
  it("blocks owner messages unless RE Leadership is signed in", () => {
    expect(
      collectionWhatsAppDisabledReason({
        recipientName: "Vikram Das",
        recipientContact: "9811100001",
        dealingCompany: "Rajshree Energy",
        due: "1000",
        overdue: "500",
        recipient: "owner",
        canMessageOwner: false,
      }),
    ).toBe("Only RE Leadership can message the owner.");
  });

  it("asks for owner contact when RE Leadership is signed in", () => {
    expect(
      collectionWhatsAppDisabledReason({
        recipientName: "Vikram Das",
        recipientContact: null,
        dealingCompany: "Rajshree Energy",
        due: "1000",
        overdue: "500",
        recipient: "owner",
        canMessageOwner: true,
      }),
    ).toBe("Add owner contact in Customers before sending WhatsApp.");
  });
});

describe("collectionWhatsAppLinks", () => {
  it("builds app and web links when phone and Rajshree Energy dealing company exist", () => {
    const links = collectionWhatsAppLinks({
      recipientName: "Ramesh",
      recipientContact: "9876543210",
      dealingCompany: "Rajshree Energy",
      due: "1000",
      overdue: "500",
    });
    expect(links?.app).toMatch(/^whatsapp:\/\/send\?phone=919876543210&text=/);
    expect(links?.web).toMatch(
      /^https:\/\/web\.whatsapp\.com\/send\?phone=919876543210&text=/,
    );
  });

  it("returns null without a phone", () => {
    expect(
      collectionWhatsAppLinks({
        recipientName: "Ramesh",
        recipientContact: null,
        dealingCompany: "Rajshree Energy",
        due: "1000",
        overdue: "500",
      }),
    ).toBeNull();
  });

  it("returns null when dealing company is not Rajshree Energy", () => {
    expect(
      collectionWhatsAppLinks({
        recipientName: "Ramesh",
        recipientContact: "9876543210",
        dealingCompany: "Other Company",
        due: "1000",
        overdue: "500",
      }),
    ).toBeNull();
  });

  it("builds owner links only for RE Leadership", () => {
    const input = {
      recipientName: "Vikram Das",
      recipientContact: "9811100001",
      dealingCompany: "Rajshree Energy",
      due: "1000",
      overdue: "500",
      recipient: "owner" as const,
    };
    expect(
      collectionWhatsAppLinks({ ...input, canMessageOwner: false }),
    ).toBeNull();
    const links = collectionWhatsAppLinks({ ...input, canMessageOwner: true });
    expect(links?.app).toMatch(/^whatsapp:\/\/send\?phone=919811100001&text=/);
    expect(decodeURIComponent(links?.app ?? "")).toContain("Sri Vikram Das");
  });
});

describe("collectionWhatsAppUrl", () => {
  it("returns the app deep link", () => {
    const url = collectionWhatsAppUrl({
      recipientName: "Ramesh",
      recipientContact: "9876543210",
      dealingCompany: "Rajshree Energy",
      due: "1000",
      overdue: "500",
    });
    expect(url).toMatch(/^whatsapp:\/\/send\?phone=919876543210&text=/);
  });
});
