import { describe, expect, it } from "vitest";
import {
  buildSalesWhatsAppMessage,
  salesWhatsAppDisabledReason,
  salesWhatsAppLinks,
} from "./salesWhatsApp";

describe("buildSalesWhatsAppMessage", () => {
  it("builds the Delivered template", () => {
    const msg = buildSalesWhatsAppMessage({
      purchaserName: "Vivek Agarwal",
      smsType: "DELIVERED",
      offerPrice: "10300",
      offerFreight: null,
    });
    expect(msg).toBe(
      [
        "Hello *Sri Vivek Agarwal*,",
        "",
        "Just sharing our offer for High GCV Indonesian coal at ₹10,300 + GST per MT, delivered to your factory.",
        "",
        "Please have a look and share your feedback.",
        "",
        "Regards,",
        "*Rajshree Energy*",
      ].join("\n"),
    );
  });

  it("builds the Ex-Port template", () => {
    const msg = buildSalesWhatsAppMessage({
      purchaserName: "Vivek Agarwal",
      smsType: "EX_PORT",
      offerPrice: "10300",
      offerFreight: "2150",
    });
    expect(msg).toBe(
      [
        "Dear *Sri Vivek Agarwal*,",
        "",
        "Just sharing our offer for High GCV Indonesian coal at ₹10,300 + GST per MT, Ex-Haldia Port. Freight is approx ₹2,150 per MT.",
        "",
        "Please have a look and share your feedback.",
        "",
        "Regards,",
        "*Rajshree Energy*",
      ].join("\n"),
    );
  });

  it("builds the Requirement template", () => {
    const msg = buildSalesWhatsAppMessage({
      purchaserName: "Vivek Agarwal",
      smsType: "REQUIREMENT",
      offerPrice: null,
      offerFreight: null,
    });
    expect(msg).toBe(
      [
        "Dear *Shri Vivek Agarwal*,",
        "",
        "Just wanted to check if you have any coal requirement coming up.",
        "",
        "Please share your requirement with us and we will be happy to work out our best possible rate.",
        "",
        "Regards,",
        "*Rajshree Energy*",
      ].join("\n"),
    );
  });
});

describe("salesWhatsAppDisabledReason", () => {
  it("requires SMS type", () => {
    expect(
      salesWhatsAppDisabledReason({
        purchaserContact: "9876543210",
        smsType: null,
        offerPrice: "10300",
        offerFreight: null,
      }),
    ).toBe("Select SMS type before sending WhatsApp.");
  });

  it("requires offer price for Delivered", () => {
    expect(
      salesWhatsAppDisabledReason({
        purchaserContact: "9876543210",
        smsType: "DELIVERED",
        offerPrice: null,
        offerFreight: null,
      }),
    ).toBe("Add offer price before sending WhatsApp.");
  });

  it("requires offer freight for Ex-Port", () => {
    expect(
      salesWhatsAppDisabledReason({
        purchaserContact: "9876543210",
        smsType: "EX_PORT",
        offerPrice: "10300",
        offerFreight: null,
      }),
    ).toBe("Add offer freight before sending WhatsApp.");
  });
});

describe("salesWhatsAppLinks", () => {
  it("builds app and web links when purchaser contact exists", () => {
    const links = salesWhatsAppLinks({
      purchaserName: "Vivek Agarwal",
      purchaserContact: "9876543210",
      smsType: "REQUIREMENT",
      offerPrice: null,
      offerFreight: null,
    });
    expect(links?.app).toMatch(/^whatsapp:\/\/send\?phone=919876543210&text=/);
    expect(links?.web).toMatch(
      /^https:\/\/web\.whatsapp\.com\/send\?phone=919876543210&text=/,
    );
  });

  it("returns null without a phone", () => {
    expect(
      salesWhatsAppLinks({
        purchaserName: "Vivek Agarwal",
        purchaserContact: null,
        smsType: "REQUIREMENT",
        offerPrice: null,
        offerFreight: null,
      }),
    ).toBeNull();
  });
});
