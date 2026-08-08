import "server-only";
import type { OrderStatus, PaymentMethod, DiscountType } from "@prisma/client";

/**
 * Order lifecycle rules (AGENTS.md §5).
 *
 * Status chain (owner-driven, strictly forward):
 *   RECEIVED → AWAITING_PAYMENT → PAID → PREPARING → DELIVERED
 *
 * - SHAM_CASH_QR orders get a PaymentCode, usable only once the owner marks
 *   the order AWAITING_PAYMENT.
 * - COD never uses a payment code and never receives a discount.
 * - PREPAID requires the order to be PAID before it can move to PREPARING.
 */

export const ORDER_STATUS_CHAIN: readonly OrderStatus[] = [
  "RECEIVED",
  "AWAITING_PAYMENT",
  "PAID",
  "PREPARING",
  "DELIVERED",
];

export type OrderTransition = {
  from: OrderStatus;
  to: OrderStatus;
  paymentMethod: PaymentMethod;
};

export type TransitionDecision =
  | { ok: true }
  | { ok: false; reason: "unknown-step" | "next-step-only" | "unpaid-preparation" };

export function canTransition({ from, to, paymentMethod }: OrderTransition): TransitionDecision {
  const fromIndex = ORDER_STATUS_CHAIN.indexOf(from);
  const toIndex = ORDER_STATUS_CHAIN.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) return { ok: false, reason: "unknown-step" };
  if (toIndex !== fromIndex + 1) return { ok: false, reason: "next-step-only" };

  // PREPAID must be paid (status PAID) before it may be prepared. This guard
  // is defense-in-depth on top of the strictly-forward rule above: jumping
  // AWAITING_PAYMENT → PREPARING stays blocked for PREPAID as well.
  if (paymentMethod === "PREPAID" && to === "PREPARING" && from !== "PAID") {
    return { ok: false, reason: "unpaid-preparation" };
  }

  return { ok: true };
}

export const canUsePaymentCode = (method: PaymentMethod) => method === "SHAM_CASH_QR";

export const discountApplicable = (method: PaymentMethod) => method !== "COD";

export type DiscountInput = {
  type: DiscountType;
  value: number;
};

/**
 * Returns the discounted total, or the original total when a discount does not
 * apply (COD is always excluded). Uses cents-only integer math to avoid float
 * drift: value is a percentage when type = PERCENT, absolute IQD when FIXED.
 */
export function applyDiscount(
  total: number,
  method: PaymentMethod,
  discount: DiscountInput | null,
): number {
  if (!discount || !discountApplicable(method)) return total;

  const cents = Math.round(total * 100);
  const amountCents =
    discount.type === "PERCENT"
      ? Math.round((cents * Math.max(0, discount.value)) / 100)
      : Math.round(discount.value * 100);

  return Math.max(0, cents - amountCents) / 100;
}