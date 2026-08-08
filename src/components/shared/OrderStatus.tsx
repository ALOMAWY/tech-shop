import type { OrderStatus as OrderStatusValue } from "@prisma/client";
import { getTranslations } from "next-intl/server";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

const STATUS_VARIANT: Record<OrderStatusValue, BadgeVariant> = {
  RECEIVED: "copper",
  AWAITING_PAYMENT: "warn",
  PAID: "blue",
  PREPARING: "purple",
  DELIVERED: "purple",
};

export async function OrderStatus({ status }: { status: OrderStatusValue }) {
  const t = await getTranslations("Orders");
  return <Badge variant={STATUS_VARIANT[status]}>{t(`status.${status}`)}</Badge>;
}