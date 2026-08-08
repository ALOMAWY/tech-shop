import { describe, it, expect } from "vitest";
import {
  PAYMENT_CODE_ALPHABET,
  PAYMENT_CODE_PATTERN,
  generatePaymentCode,
  withUniqueRetry,
} from "./payment-code";

describe("generatePaymentCode", () => {
  it("matches the PAY-XXXX-XXXX format", () => {
    for (let i = 0; i < 50; i++) {
      expect(generatePaymentCode()).toMatch(PAYMENT_CODE_PATTERN);
    }
  });

  it("only uses unambiguous alphanumerics", () => {
    for (let i = 0; i < 100; i++) {
      const code = generatePaymentCode();
      expect(code).not.toMatch(/[0O1I]/);
      for (const ch of code.replaceAll("-", "")) {
        expect(PAYMENT_CODE_ALPHABET).toContain(ch);
      }
    }
  });

  it("wraps high roll indices back into the alphabet", () => {
    expect(generatePaymentCode(() => 1)).toBe("PAY-BBBB-BBBB");
    expect(generatePaymentCode(() => PAYMENT_CODE_ALPHABET.length - 1)).toBe(
      `PAY-${PAYMENT_CODE_ALPHABET[PAYMENT_CODE_ALPHABET.length - 1].repeat(4)}-${PAYMENT_CODE_ALPHABET[PAYMENT_CODE_ALPHABET.length - 1].repeat(4)}`,
    );
  });

  it("produces distinct codes across many draws (collision-proof enough)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 10_000; i++) seen.add(generatePaymentCode());
    expect(seen.size).toBe(10_000);
  });
});

describe("withUniqueRetry", () => {
  const uniqueLike = (field: string) => ({
    code: "P2002",
    meta: { target: [field] },
  });

  it("returns the first generated value when insert succeeds", async () => {
    const value = await withUniqueRetry({
      generate: () => "PAY-AAAA-AAAA",
      insert: async () => undefined,
      isUniqueError: (e) => (e as { code?: string }).code === "P2002",
      maxAttempts: 3,
    });
    expect(value).toBe("PAY-AAAA-AAAA");
  });

it("retries on a unique-constraint error then returns a fresh value", async () => {
    let calls = 0;
    const value = await withUniqueRetry({
      generate: () => (calls === 0 ? "PAY-BBBB-BBBB" : "PAY-CCCC-CCCC"),
      insert: async (v) => {
        calls++;
        if (calls === 1) throw uniqueLike("code");
        expect(v).toMatch(PAYMENT_CODE_PATTERN);
      },
      isUniqueError: (e) => (e as { code?: string }).code === "P2002",
      maxAttempts: 3,
    });
    expect(calls).toBeGreaterThan(1);
    expect(value).toMatch(PAYMENT_CODE_PATTERN);
  });

  it("throws (does not return a duplicate) after maxAttempts unique collisions", async () => {
    await expect(
      withUniqueRetry({
        generate: () => "PAY-CCCC-CCCC",
        insert: async () => {
          throw uniqueLike("code");
        },
        isUniqueError: (e) => (e as { code?: string }).code === "P2002",
        maxAttempts: 2,
      }),
    ).rejects.toThrow("after 2 attempts");
  });

  it("re-throws non-unique errors immediately", async () => {
    await expect(
      withUniqueRetry({
        generate: () => "PAY-DDDD-DDDD",
        insert: async () => {
          throw new Error("connection lost");
        },
        isUniqueError: (e) => (e as { code?: string }).code === "P2002",
        maxAttempts: 3,
      }),
    ).rejects.toThrow("connection lost");
  });
});