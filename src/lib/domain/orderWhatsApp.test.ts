import { describe, expect, it } from "vitest";
import {
  buildOrderWhatsAppMessage,
  orderWhatsAppDisabledReason,
  orderWhatsAppLinks,
} from "./orderWhatsApp";

const industryForInput = {
  purchaserName: "Sunil Tulshian",
  purchaserContact: "9876543210",
  customerCategory: "INDUSTRY",
  numberOfLorries: 6,
  quantity: "150",
  rate: "11300",
  deliveryTerms: "FOR",
  portName: null,
  creditDays: 15,
};

describe("buildOrderWhatsAppMessage", () => {
  it("uses lorries as trucks, GST-only rate, and FOR factory delivery", () => {
    const msg = buildOrderWhatsAppMessage(industryForInput);
    expect(msg).toBe(
      [
        "Hello *Sri Sunil Tulshian*,",
        "",
        "Thank you for the order. We are pleased to accept the order on the following terms:",
        "",
        "• *Quantity*: 6 Trucks",
        "• *Rate*: ₹11,300 + GST",
        "• *Delivery*: FOR at your Factory",
        "• *Payment*: 15 Days",
        "",
        "We sincerely appreciate your trust and continued support.",
        "",
        "Regards,",
        "*Rajshree Energy*",
      ].join("\n"),
    );
  });

  it("uses MT quantity when lorries are empty and adds TCS for traders", () => {
    const msg = buildOrderWhatsAppMessage({
      ...industryForInput,
      purchaserName: "Ramesh Shah",
      customerCategory: "TRADER",
      numberOfLorries: null,
      quantity: "150",
      rate: "19200",
      deliveryTerms: "EX_PORT",
      portName: "Haldia Port",
    });
    expect(msg).toContain("• *Quantity*: 150 MT");
    expect(msg).toContain("• *Rate*: ₹19,200 + GST + TCS");
    expect(msg).toContain("• *Delivery*: Ex-Haldia Port");
  });

  it("adds TCS for vendors and appends Port when the name has none", () => {
    const msg = buildOrderWhatsAppMessage({
      ...industryForInput,
      customerCategory: "SUPPLIER",
      numberOfLorries: 0,
      quantity: "38.18",
      rate: "19200",
      deliveryTerms: "EX_PORT",
      portName: "Paradip",
      creditDays: 1,
    });
    expect(msg).toContain("• *Quantity*: 38.18 MT");
    expect(msg).toContain("• *Rate*: ₹19,200 + GST + TCS");
    expect(msg).toContain("• *Delivery*: Ex-Paradip Port");
    expect(msg).toContain("• *Payment*: 1 Day");
  });

  it("uses singular Truck for one lorry", () => {
    const msg = buildOrderWhatsAppMessage({
      ...industryForInput,
      numberOfLorries: 1,
    });
    expect(msg).toContain("• *Quantity*: 1 Truck");
  });
});

describe("orderWhatsAppDisabledReason", () => {
  it("requires purchaser contact", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        purchaserContact: null,
      }),
    ).toBe("Add purchaser contact in Customers before sending WhatsApp.");
  });

  it("requires customer category", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        customerCategory: null,
      }),
    ).toBe("Set customer category before sending WhatsApp.");
  });

  it("requires quantity or lorries", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        numberOfLorries: null,
        quantity: null,
      }),
    ).toBe("Add number of lorries or order quantity before sending WhatsApp.");
  });

  it("requires basic rate", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        rate: null,
      }),
    ).toBe("Add basic rate before sending WhatsApp.");
  });

  it("requires delivery terms", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        deliveryTerms: null,
      }),
    ).toBe("Set delivery term before sending WhatsApp.");
  });

  it("requires port for Ex-Port", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        deliveryTerms: "EX_PORT",
        portName: null,
      }),
    ).toBe("Set port before sending WhatsApp for Ex-Port orders.");
  });

  it("requires credit period", () => {
    expect(
      orderWhatsAppDisabledReason({
        ...industryForInput,
        creditDays: null,
      }),
    ).toBe("Add credit period before sending WhatsApp.");
  });
});

describe("orderWhatsAppLinks", () => {
  it("builds app and web links when the order is complete", () => {
    const links = orderWhatsAppLinks(industryForInput);
    expect(links?.app).toMatch(/^whatsapp:\/\/send\?phone=919876543210&text=/);
    expect(links?.web).toMatch(
      /^https:\/\/web\.whatsapp\.com\/send\?phone=919876543210&text=/,
    );
    expect(decodeURIComponent(links?.app ?? "")).toContain(
      "Hello *Sri Sunil Tulshian*",
    );
  });

  it("returns null without a phone", () => {
    expect(
      orderWhatsAppLinks({
        ...industryForInput,
        purchaserContact: null,
      }),
    ).toBeNull();
  });
});
