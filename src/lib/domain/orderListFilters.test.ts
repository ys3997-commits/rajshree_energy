import { describe, expect, it } from "vitest";
import {
  DEFAULT_ORDER_LIST_STATUS,
  resolveOrderListStatusFilter,
  resolveOrderListTypeFilter,
} from "./orderListFilters";

describe("resolveOrderListStatusFilter", () => {
  it("defaults to Running when status is omitted", () => {
    expect(resolveOrderListStatusFilter(undefined)).toBe("RUNNING");
    expect(DEFAULT_ORDER_LIST_STATUS).toBe("RUNNING");
  });

  it("treats an empty status param as All", () => {
    expect(resolveOrderListStatusFilter("")).toBe("");
  });

  it("keeps Running and Completed", () => {
    expect(resolveOrderListStatusFilter("RUNNING")).toBe("RUNNING");
    expect(resolveOrderListStatusFilter("COMPLETED")).toBe("COMPLETED");
  });

  it("falls back to Running for unknown values", () => {
    expect(resolveOrderListStatusFilter("OPEN")).toBe("RUNNING");
  });
});

describe("resolveOrderListTypeFilter", () => {
  it("treats a missing or empty type as All", () => {
    expect(resolveOrderListTypeFilter(undefined)).toBe("");
    expect(resolveOrderListTypeFilter("")).toBe("");
  });

  it("keeps Committed (REGULAR) and Open", () => {
    expect(resolveOrderListTypeFilter("REGULAR")).toBe("REGULAR");
    expect(resolveOrderListTypeFilter("OPEN")).toBe("OPEN");
  });

  it("ignores unknown type values", () => {
    expect(resolveOrderListTypeFilter("COMMITTED")).toBe("");
  });
});
