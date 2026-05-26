import { describe, it, expect } from "vitest";
import { Platform } from "./platform";

describe("Platform", () => {
  it("has 3 values", () => {
    expect(Object.values(Platform)).toHaveLength(3);
  });
});
