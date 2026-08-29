import { describe, expect, it } from "vitest";
import {
  DEFAULT_ORDER_LIST_STATUS,
  resolveOrderListStatusFilter,
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
