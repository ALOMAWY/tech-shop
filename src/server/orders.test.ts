import { describe, it, expect } from "vitest";
import {
  canTransition,
  canUsePaymentCode,
  discountApplicable,
  applyDiscount,
} from "./orders";

describe("canTransition", () => {
  it("allows a strict forward step", () => {
    expect(canTransition({ from: "RECEIVED", to: "AWAITING_PAYMENT", paymentMethod: "SHAM_CASH_QR" })).toEqual({ ok: true });
    expect(canTransition({ from: "AWAITING_PAYMENT", to: "PAID", paymentMethod: "SHAM_CASH_QR" })).toEqual({ ok: true });
    expect(canTransition({ from: "PAID", to: "PREPARING", paymentMethod: "SHAM_CASH_QR" })).toEqual({ ok: true });
    expect(canTransition({ from: "PREPARING", to: "DELIVERED", paymentMethod: "SHAM_CASH_QR" })).toEqual({ ok: true });
  });

  it("rejects skipping a status", () => {
    expect(canTransition({ from: "RECEIVED", to: "PAID", paymentMethod: "SHAM_CASH_QR" })).toEqual({
      ok: false,
      reason: "next-step-only",
    });
    expect(canTransition({ from: "RECEIVED", to: "DELIVERED", paymentMethod: "COD" })).toEqual({
      ok: false,
      reason: "next-step-only",
    });
  });

  it("rejects moving backwards", () => {
    expect(canTransition({ from: "PAID", to: "AWAITING_PAYMENT", paymentMethod: "SHAM_CASH_QR" })).toEqual({
      ok: false,
      reason: "next-step-only",
    });
  });

  it("rejects unknown statuses", () => {
    expect(canTransition({ from: "RECEIVED", to: "NOPE" as never, paymentMethod: "COD" })).toEqual({
      ok: false,
      reason: "unknown-step",
    });
  });

  it("blocks PREPAID from moving to PREPARING unless it is paid", () => {
    expect(canTransition({ from: "PAID", to: "PREPARING", paymentMethod: "PREPAID" })).toEqual({ ok: true });
    expect(
      canTransition({ from: "AWAITING_PAYMENT", to: "PREPARING", paymentMethod: "PREPAID" }),
    ).toEqual({ ok: false, reason: "next-step-only" });
  });
});

describe("canUsePaymentCode / discountApplicable", () => {
  it("only Sham Cash QR uses a payment code", () => {
    expect(canUsePaymentCode("SHAM_CASH_QR")).toBe(true);
    expect(canUsePaymentCode("COD")).toBe(false);
    expect(canUsePaymentCode("PREPAID")).toBe(false);
  });

  it("COD never gets a discount", () => {
    expect(discountApplicable("COD")).toBe(false);
    expect(discountApplicable("SHAM_CASH_QR")).toBe(true);
    expect(discountApplicable("PREPAID")).toBe(true);
  });
});

describe("applyDiscount", () => {
  it("returns the total unchanged when discount is null", () => {
    expect(applyDiscount(10_000, "SHAM_CASH_QR", null)).toBe(10_000);
  });

  it("never discounts COD", () => {
    expect(applyDiscount(10_000, "COD", { type: "PERCENT", value: 10 })).toBe(10_000);
    expect(applyDiscount(10_000, "COD", { type: "FIXED", value: 1_000 })).toBe(10_000);
  });

  it("applies a percentage discount on Sham Cash", () => {
    expect(applyDiscount(1_000, "SHAM_CASH_QR", { type: "PERCENT", value: 10 })).toBe(900);
  });

  it("applies a fixed amount discount on prepaid", () => {
    expect(applyDiscount(1_000, "PREPAID", { type: "FIXED", value: 250 })).toBe(750);
  });

  it("never goes below zero and floors to whole IQD", () => {
    expect(applyDiscount(100, "SHAM_CASH_QR", { type: "PERCENT", value: 100 })).toBe(0);
    expect(applyDiscount(10, "SHAM_CASH_QR", { type: "PERCENT", value: 90 })).toBe(1);
  });
});