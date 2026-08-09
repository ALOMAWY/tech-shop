import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import type { OrderDto } from "./types";
import { buildOrder, codeForAwaitingPayment } from "./mock";

/**
 * Mock order store — mirrors what the server action + Prisma will persist once
 * Postgres is wired (M1/M3 schema exists). Persisted to localStorage so orders
 * survive reloads during DB-less development, exactly like the cart store.
 */

export type NewOrderInput = {
  customerId: string;
  customerName: string;
  lines: OrderDto["items"];
  paymentMethod: OrderDto["paymentMethod"];
  discountCode?: string;
};

type OrderStoreState = {
  orders: OrderDto[];
  placeOrder: (input: NewOrderInput) => OrderDto;
  confirmOrder: (orderId: string) => void;
  updateStatus: (orderId: string, status: OrderStatus) => void;
  markCodeUsed: (orderId: string) => void;
  clearOrders: () => void;
};

function setOrderStatus(orders: OrderDto[], orderId: string, status: OrderStatus) {
  return orders.map((o) => (o.id === orderId ? { ...o, status } : o));
}

export const useOrderStore = create<OrderStoreState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (input) => {
        const order = buildOrder({
          customerId: input.customerId,
          customerName: input.customerName,
          lines: input.lines,
          method: input.paymentMethod,
          discountCode: input.discountCode,
        });
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      confirmOrder: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        if (!order) return;
        const existing = order.paymentCode;
        const paymentCode = existing ?? codeForAwaitingPayment(order.paymentMethod);
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, paymentCode, status: "AWAITING_PAYMENT" } : o,
          ),
        }));
      },

      updateStatus: (orderId, status) => {
        set((state) => ({ orders: setOrderStatus(state.orders, orderId, status) }));
      },

      markCodeUsed: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId && o.paymentCode
              ? { ...o, paymentCode: { ...o.paymentCode, status: "USED" as PaymentStatus } }
              : o,
          ),
        }));
      },

      clearOrders: () => set({ orders: [] }),
    }),
    { name: "orders-storage" },
  ),
);