"use client";

import { useTranslations } from "next-intl";
import { useOrderStore } from "@/features/orders/orders-store";
import { ORDER_STATUS_CHAIN } from "@/lib/orders";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

const STATUS_VARIANT: Record<string, "copper" | "warn" | "blue" | "purple" | "ok"> = {
  RECEIVED: "copper",
  AWAITING_PAYMENT: "warn",
  PAID: "blue",
  PREPARING: "purple",
  DELIVERED: "ok",
};

export function OwnerOrderList() {
  const t = useTranslations("Orders");
  const orders = useOrderStore((s) => s.orders);

  if (orders.length === 0) {
    return <Card pad className="py-12 text-center text-sm text-text-2">{t("empty")}</Card>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Card key={order.id} pad className="flex flex-wrap items-center gap-4">
          <div className="min-w-[160px] flex-1">
            <p className="mono lat text-xs text-text-2">{order.id}</p>
            <p className="mt-0.5 truncate text-sm font-medium">{order.customerName}</p>
            <p className="text-xs text-text-2">{t(`paymentMethods.${order.paymentMethod}`)}</p>
          </div>

          {order.paymentCode ? (
            <span className="mono lat text-xs text-mint">
              {order.paymentCode.status === "USED" ? "✓" : ""} {order.paymentCode.code}
            </span>
          ) : (
            <span className="mono lat text-xs text-text-2">—</span>
          )}

          <Badge variant={STATUS_VARIANT[order.status]}>{t(`status.${order.status}`)}</Badge>
          <span className="mono lat text-sm">{order.total.toFixed(2)}</span>
          <Link href={`/dashboard/orders/${order.id}`} className={buttonClasses("ghost")}>
            {t("check")}
          </Link>
        </Card>
      ))}
    </div>
  );
}

export const OWNER_STATUS_CHAIN = ORDER_STATUS_CHAIN;