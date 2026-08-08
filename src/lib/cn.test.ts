import { describe, it } from "vitest";
import { expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy classes", () => {
    expect(cn("a", "b", null, undefined, "c")).toBe("a b c");
  });

  it("returns empty string for no classes", () => {
    expect(cn()).toBe("");
  });
});