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

export function OrderList() {
  const t = useTranslations("Orders");
  const orders = useOrderStore((s) => s.orders);

  if (orders.length === 0) {
    return <Card pad className="py-12 text-center text-sm text-text-2">{t("empty")}</Card>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const step = ORDER_STATUS_CHAIN.indexOf(order.status);
        const totalSteps = ORDER_STATUS_CHAIN.length;
        return (
          <Card key={order.id} pad className="flex flex-wrap items-center gap-4">
            <div className="min-w-[180px] flex-1">
              <p className="mono lat text-xs text-text-2">{order.id}</p>
              <p className="mt-0.5 truncate text-sm font-medium">
                {order.items[0]?.name}
                {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
              </p>
              <p className="mono lat mt-1 text-xs text-text-2">{t(`paymentMethods.${order.paymentMethod}`)}</p>
            </div>

            <div className="w-40">
              <div className="mb-1 flex gap-0.5" aria-hidden>
                {ORDER_STATUS_CHAIN.map((_, i) => (
                  <span
                    key={i}
                    className={
                      i < step
                        ? "h-1 flex-1 rounded-full bg-mint"
                        : i === step
                          ? "h-1 flex-1 rounded-full bg-copper"
                          : "h-1 flex-1 rounded-full bg-surface-2"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-text-2">
                {step + 1}/{totalSteps}
              </span>
            </div>

            <Badge variant={STATUS_VARIANT[order.status]}>{t(`status.${order.status}`)}</Badge>
            <span className="mono lat text-sm">{order.total.toFixed(2)}</span>
            <Link href={`/orders/${order.id}`} className={buttonClasses("ghost")}>
              {t("check")}
            </Link>
          </Card>
        );
      })}
    </div>
  );
}