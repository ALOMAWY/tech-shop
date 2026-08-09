import type { DiscountType, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export type { DiscountType, OrderStatus, PaymentMethod, PaymentStatus };

export type OrderLineDto = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  price: number;
};

export type PaymentCodeDto = {
  code: string;
  status: PaymentStatus;
};

export type OrderDto = {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderLineDto[];
  subtotal: number;
  discountAmount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  discountCode?: string;
  paymentCode?: PaymentCodeDto | null;
  createdAt: string;
};

export type PaymentMethodOption = {
  method: PaymentMethod;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "SHAM_CASH_QR",
  "PREPAID",
  "COD",
];