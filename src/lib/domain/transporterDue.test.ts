import { describe, expect, it } from "vitest";
import {
  computeTransporterDue,
  computeTransporterPayableDue,
  freightBilledAmount,
} from "./transporterDue";

describe("transporter freight billed", () => {
  it("uses freight PMT × dispatched quantity", () => {
    expect(freightBilledAmount(800, 10).toString()).toBe("8000");
  });
});

describe("computeTransporterDue", () => {
  it("is −opening due + total freight − fund paid + fund received", () => {
    expect(computeTransporterDue(1000, 10000, 3000, 200).toString()).toBe(
      "6200",
    );
    expect(computeTransporterDue(-453145, 692172.5, 1203145, 0).toString()).toBe(
      "-57827.5",
    );
  });
});

describe("computeTransporterPayableDue", () => {
  it("is −opening due + freight × 0.99 − paid + received", () => {
    expect(
      computeTransporterPayableDue(1000, 10000, 3000, 200).toString(),
    ).toBe("6100");
  });
});
