import { describe, expect, it } from "vitest";
import { joinPersonName, splitPersonName } from "./personName";

describe("person names", () => {
  it("splits a first and last name", () => {
    expect(splitPersonName("Prakash Surana")).toEqual({
      firstName: "Prakash",
      lastName: "Surana",
    });
  });

  it("keeps extra words on the last name", () => {
    expect(splitPersonName("Prakash Kumar Surana")).toEqual({
      firstName: "Prakash",
      lastName: "Kumar Surana",
    });
  });

  it("joins the two parts", () => {
    expect(joinPersonName("  Prakash ", " Surana ")).toBe("Prakash Surana");
  });
});
