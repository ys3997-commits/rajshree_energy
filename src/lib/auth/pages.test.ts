import { describe, expect, it } from "vitest";
import {
  canAccessPath,
  firstAllowedPath,
  hasAnyReportAccess,
  pageForPath,
} from "./pages";

describe("pageForPath", () => {
  it("matches home exactly", () => {
    expect(pageForPath("/")?.key).toBe("home");
    expect(pageForPath("/orders")?.key).toBe("orders");
  });

  it("uses the longest report prefix", () => {
    expect(pageForPath("/reports/collection")?.key).toBe("reports-collection");
    expect(pageForPath("/reports/collection/vendor")?.key).toBe(
      "reports-collection-vendor",
    );
    expect(pageForPath("/reports/vessel/supplied/abc")?.key).toBe(
      "reports-vessel-supplied",
    );
    expect(pageForPath("/reports/vessel/xyz")?.key).toBe("reports-vessel");
  });

  it("maps old report URLs to current pages", () => {
    expect(pageForPath("/reports/quality-report")?.key).toBe("reports-quality");
    expect(pageForPath("/staff")?.key).toBe("options");
  });
});

describe("canAccessPath", () => {
  it("allows owner everything", () => {
    expect(canAccessPath("all", "/options")).toBe(true);
    expect(canAccessPath("all", "/reports/ledger")).toBe(true);
  });

  it("blocks options and unknown routes for staff", () => {
    expect(canAccessPath(["payments"], "/options")).toBe(false);
    expect(canAccessPath("all", "/options/origins")).toBe(true);
    expect(canAccessPath(["payments"], "/receipts/pending")).toBe(false);
    expect(canAccessPath(["payments"], "/payments")).toBe(true);
    expect(canAccessPath(["payments"], "/payments/discount")).toBe(true);
    expect(canAccessPath(["bills"], "/bills")).toBe(true);
    expect(canAccessPath(["payments"], "/bills")).toBe(false);
    expect(canAccessPath(["payments"], "/")).toBe(false);
  });

  it("allows the reports index when any report is granted", () => {
    expect(canAccessPath(["reports-ledger"], "/reports")).toBe(true);
    expect(canAccessPath(["payments"], "/reports")).toBe(false);
    expect(hasAnyReportAccess(["reports-ledger"])).toBe(true);
  });

  it("scopes update sub-pages separately", () => {
    expect(canAccessPath(["update-purchase"], "/update/purchase")).toBe(true);
    expect(canAccessPath(["update-purchase"], "/update/sale")).toBe(false);
    expect(canAccessPath(["update"], "/update/purchase")).toBe(true);
    expect(canAccessPath(["update-sale"], "/update/transport")).toBe(false);
    expect(
      canAccessPath(["reports-transport-engine"], "/update/transport"),
    ).toBe(true);
  });

  it("scopes bank sub-pages separately", () => {
    expect(canAccessPath(["payments-transactions"], "/payments")).toBe(true);
    expect(canAccessPath(["payments-transactions"], "/payments/discount")).toBe(
      false,
    );
    expect(canAccessPath(["payments-discount"], "/payments/discount")).toBe(true);
    expect(canAccessPath(["payments-discount"], "/payments")).toBe(false);
    expect(canAccessPath(["payments"], "/payments")).toBe(true);
    expect(canAccessPath(["payments"], "/payments/discount")).toBe(true);
  });

  it("scopes master options sub-pages separately", () => {
    expect(canAccessPath(["options-origins"], "/options/origins")).toBe(true);
    expect(canAccessPath(["options-origins"], "/options/ports")).toBe(false);
    expect(canAccessPath(["options-ports"], "/options/ports")).toBe(true);
    expect(canAccessPath(["options-origins"], "/options/team")).toBe(false);
    expect(canAccessPath("all", "/options/team")).toBe(true);
  });

  it("expands legacy options key to all master option sub-pages", () => {
    expect(canAccessPath(["options"], "/options/ports")).toBe(true);
    expect(canAccessPath(["options"], "/options/origins")).toBe(true);
    expect(canAccessPath(["options"], "/options/team")).toBe(false);
  });

  it("allows master entity pages when the key is granted", () => {
    expect(canAccessPath(["customers"], "/customers")).toBe(true);
    expect(canAccessPath(["vessels"], "/vessels")).toBe(true);
    expect(canAccessPath(["options-ports"], "/customers")).toBe(false);
  });
});

describe("firstAllowedPath", () => {
  it("returns the first granted page, without requiring Home", () => {
    expect(firstAllowedPath(["payments"])).toBe("/payments");
    expect(firstAllowedPath(["home", "payments"])).toBe("/");
    expect(firstAllowedPath([])).toBe("/login");
  });

  it("does not land on Approvals when another page is granted", () => {
    expect(
      firstAllowedPath([
        "bills",
        "reports-collection",
        "reports-collection-vendor",
      ]),
    ).toBe("/reports/collection");
    expect(firstAllowedPath(["bills", "payments"])).toBe("/payments");
    expect(firstAllowedPath(["bills"])).toBe("/bills");
  });
});
