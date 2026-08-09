import { describe, it, expect } from "vitest";
import { buildOrder, orderTotal, codeForAwaitingPayment } from "./mock";
import type { OrderLineDto } from "./types";

const LINES: OrderLineDto[] = [
  { productId: "1", sku: "SKU-1", name: "مقاومات", quantity: 3, price: 10 },
  { productId: "2", sku: "SKU-2", name: "مكثفات", quantity: 2, price: 5.5 },
];

describe("orderTotal", () => {
  it("sums line totals", () => {
    const { subtotal } = orderTotal(LINES, "SHAM_CASH_QR", null);
    expect(subtotal).toBeCloseTo(41, 5);
  });

  it("applies percent discount (cents math)", () => {
    const { total, discountAmount } = orderTotal(LINES, "SHAM_CASH_QR", {
      type: "PERCENT",
      value: 10,
    });
    expect(discountAmount).toBeCloseTo(4.1, 5);
    expect(total).toBeCloseTo(36.9, 5);
  });

  it("applies fixed discount", () => {
    const { total, discountAmount } = orderTotal(LINES, "PREPAID", {
      type: "FIXED",
      value: 5,
    });
    expect(discountAmount).toBeCloseTo(5, 5);
    expect(total).toBeCloseTo(36, 5);
  });

  it("never discounts COD even when a discount is passed", () => {
    const { total, discountAmount } = orderTotal(LINES, "COD", {
      type: "PERCENT",
      value: 50,
    });
    expect(discountAmount).toBe(0);
    expect(total).toBeCloseTo(41, 5);
  });
});

describe("buildOrder", () => {
  it("creates a RECEIVED order with paymentCode null", () => {
    const order = buildOrder({
      customerId: "c1",
      customerName: "زبون",
      lines: LINES,
      method: "SHAM_CASH_QR",
    });
    expect(order.status).toBe("RECEIVED");
    expect(order.paymentCode).toBeNull();
    expect(order.total).toBeCloseTo(41, 5);
  });

  it("keeps discount code on the order", () => {
    const order = buildOrder({
      customerId: "c1",
      customerName: "زبون",
      lines: LINES,
      method: "SHAM_CASH_QR",
      discountCode: "TECH10",
      discount: { type: "PERCENT", value: 10 },
    });
    expect(order.discountCode).toBe("TECH10");
    expect(order.total).toBeCloseTo(36.9, 5);
  });
});

describe("codeForAwaitingPayment", () => {
  it("returns an INACTIVE code for SHAM_CASH_QR", () => {
    const code = codeForAwaitingPayment("SHAM_CASH_QR");
    expect(code).not.toBeNull();
    expect(code!.status).toBe("INACTIVE");
    expect(code!.code).toMatch(/^PAY-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
  });

  it("returns null for COD and PREPAID", () => {
    expect(codeForAwaitingPayment("COD")).toBeNull();
    expect(codeForAwaitingPayment("PREPAID")).toBeNull();
  });
});