import type { OrderStatus, PaymentMethod } from "@prisma/client";
import {
  applyDiscount,
  canUsePaymentCode,
  ORDER_STATUS_CHAIN,
  type DiscountInput,
} from "@/lib/orders";
import { generatePaymentCode } from "@/lib/payment-code";
import type { OrderDto, OrderLineDto, PaymentCodeDto } from "./types";

/**
 * Pure order building for the mock (DB-less) checkout. The exact same math
 * (subtotal → discount → total) will live in the server action once Postgres is
 * wired; this mirrors `src/server/orders.ts` rules 1:1.
 */

export function orderSubtotal(lines: OrderLineDto[]): number {
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

export function orderTotal(
  lines: OrderLineDto[],
  method: PaymentMethod,
  discount: DiscountInput | null,
): { subtotal: number; discountAmount: number; total: number } {
  const subtotal = orderSubtotal(lines);
  const total = applyDiscount(subtotal, method, discount);
  return { subtotal, discountAmount: Math.round((subtotal - total) * 100) / 100, total };
}

export function createPaymentCode(): PaymentCodeDto {
  return { code: generatePaymentCode(), status: "INACTIVE" };
}

export type BuildOrderInput = {
  customerId: string;
  customerName: string;
  lines: OrderLineDto[];
  method: PaymentMethod;
  discount?: DiscountInput;
  discountCode?: string;
  id?: string;
  createdAt?: string;
};

export function buildOrder(input: BuildOrderInput): OrderDto {
  const { subtotal, discountAmount, total } = orderTotal(input.lines, input.method, input.discount ?? null);
  return {
    id: input.id ?? `ord_${Math.random().toString(36).slice(2, 10)}`,
    customerId: input.customerId,
    customerName: input.customerName,
    items: input.lines,
    subtotal,
    discountAmount,
    total,
    status: "RECEIVED",
    paymentMethod: input.method,
    discountCode: input.discountCode,
    paymentCode: null,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

/**
 * Creates the payment code for SHAM_CASH_QR orders when the owner confirms the
 * order (RECEIVED → AWAITING_PAYMENT). Returns null for methods that never use
 * a code (COD, PREPAID).
 */
export function codeForAwaitingPayment(method: PaymentMethod): PaymentCodeDto | null {
  return canUsePaymentCode(method) ? createPaymentCode() : null;
}

export function nextStatusFor(status: OrderStatus): OrderStatus | null {
  const index = ORDER_STATUS_CHAIN.indexOf(status);
  if (index === -1 || index === ORDER_STATUS_CHAIN.length - 1) return null;
  return ORDER_STATUS_CHAIN[index + 1];
}

export { canUsePaymentCode };