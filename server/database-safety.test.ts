import { afterEach, describe, expect, it } from "vitest";
import { getDb } from "./db";

const previousMode = process.env.ERAS_TEST_MODE;

afterEach(() => {
  if (previousMode === undefined) delete process.env.ERAS_TEST_MODE;
  else process.env.ERAS_TEST_MODE = previousMode;
});

describe("database safety in automated tests", () => {
  it("does not open the shared database when ERAS_TEST_MODE is enabled", async () => {
    process.env.ERAS_TEST_MODE = "1";
    await expect(getDb()).resolves.toBeNull();
  });
});

export {};
