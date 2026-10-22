import { describe, expect, it } from "vitest";
import { usernameFromName } from "./username";

describe("usernameFromName", () => {
  it("joins the first and last name", () => {
    expect(usernameFromName("Prakash Surana")).toBe("prakash.surana");
    expect(usernameFromName("  Ashok   Goel ")).toBe("ashok.goel");
  });

  it("drops a middle name", () => {
    expect(usernameFromName("Prakash Kumar Surana")).toBe("prakash.surana");
  });

  it("accepts a username typed with a dot or mixed case", () => {
    expect(usernameFromName("Prakash.Surana")).toBe("prakash.surana");
  });

  it("keeps a single name as one word", () => {
    expect(usernameFromName("Prakash")).toBe("prakash");
  });
});
