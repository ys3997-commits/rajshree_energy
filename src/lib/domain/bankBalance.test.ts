import { describe, expect, it } from "vitest";
import { bankAccountBalance } from "./bankBalance";

describe("bankAccountBalance", () => {
  it("adds fund received and subtracts fund paid from opening balance", () => {
    expect(bankAccountBalance(100000, 25000, 40000).toString()).toBe("85000");
  });

  it("treats a missing opening balance as zero", () => {
    expect(bankAccountBalance(0, 500, 200).toString()).toBe("300");
  });
});
