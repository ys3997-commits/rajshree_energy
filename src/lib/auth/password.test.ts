import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("accepts the original password and rejects another", async () => {
    const stored = await hashPassword("desk-secret");
    expect(await verifyPassword("desk-secret", stored)).toBe(true);
    expect(await verifyPassword("other-secret", stored)).toBe(false);
  });

  it("rejects a malformed stored hash", async () => {
    expect(await verifyPassword("desk-secret", "not-a-hash")).toBe(false);
  });
});
