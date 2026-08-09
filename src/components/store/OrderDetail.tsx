"use client";

import { useTranslations } from "next-intl";
import { useOrderStore } from "@/features/orders/orders-store";
import { canUsePaymentCode } from "@/lib/orders";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PaymentQr } from "@/components/shared/PaymentQr";
import { Link } from "@/i18n/navigation";

const STATUS_VARIANT: Record<string, "copper" | "warn" | "blue" | "purple" | "ok"> = {
  RECEIVED: "copper",
  AWAITING_PAYMENT: "warn",
  PAID: "blue",
  PREPARING: "purple",
  DELIVERED: "ok",
};

export function OrderDetail({ orderId }: { orderId: string }) {
  const t = useTranslations("Orders");
  const tp = useTranslations("Payment");
  const order = useOrderStore((s) => s.orders.find((o) => o.id === orderId));

  if (!order) {
    return (
      <Card pad className="py-12 text-center">
        <p className="text-sm text-text-2">{t("notFound")}</p>
        <Link href="/orders" className="mt-4 inline-block text-xs text-copper">
          ← {t("backToOrders")}
        </Link>
      </Card>
    );
  }

  const showCode = canUsePaymentCode(order.paymentMethod) && order.status === "AWAITING_PAYMENT";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card pad>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono lat text-xs text-text-2">{order.id}</p>
              <p className="mt-1 text-sm text-text-2">{t("placedAt")}</p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>{t(`status.${order.status}`)}</Badge>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-medium">{t("line")}</h3>
            <ul className="divide-y divide-dashed divide-line-soft">
              {order.items.map((line) => (
                <li key={line.productId} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate">{line.name}</span>
                    <span className="mono lat block text-xs text-text-2">×{line.quantity}</span>
                  </span>
                  <span className="mono lat text-sm">{(line.price * line.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            {order.discountAmount > 0 ? (
              <div className="mt-2 flex justify-between text-sm text-mint">
                <span>{t("discount")}</span>
                <span className="mono lat">−{order.discountAmount.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
              <span className="text-sm font-medium">{t("total")}</span>
              <span className="mono lat text-lg text-copper">{order.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card pad>
          <h3 className="mb-3 text-sm font-medium">{t("paymentCode")}</h3>
          {showCode && order.paymentCode ? (
            <>
              <PaymentQr value={order.paymentCode.code} label={order.paymentCode.code} />
              <h4 className="mt-4 text-sm font-medium">{t("howToPay")}</h4>
              <ol className="mt-2 list-inside list-decimal space-y-1.5 text-xs text-text-2">
                <li>{tp("shamSteps.one")}</li>
                <li>{tp("shamSteps.two")}</li>
                <li>{tp("shamSteps.three")}</li>
              </ol>
            </>
          ) : canUsePaymentCode(order.paymentMethod) && order.status === "RECEIVED" ? (
            <p className="text-xs text-text-2">{t("codeActive")}</p>
          ) : (
            <p className="text-xs text-text-2">{t("payable")}</p>
          )}
        </Card>
      </div>
    </div>
  );
}