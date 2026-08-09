"use client";

import { useTranslations } from "next-intl";
import { useOrderStore } from "@/features/orders/orders-store";
import {
  ORDER_STATUS_CHAIN,
  canTransition,
  canUsePaymentCode,
} from "@/lib/orders";
import { nextStatusFor } from "@/features/orders/mock";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PaymentQr } from "@/components/shared/PaymentQr";
import { cn } from "@/lib/cn";

const STATUS_VARIANT: Record<string, "copper" | "warn" | "blue" | "purple" | "ok"> = {
  RECEIVED: "copper",
  AWAITING_PAYMENT: "warn",
  PAID: "blue",
  PREPARING: "purple",
  DELIVERED: "ok",
};

export function OwnerOrderDetail({ orderId }: { orderId: string }) {
  const t = useTranslations("Orders");
  const order = useOrderStore((s) => s.orders.find((o) => o.id === orderId));
  const { confirmOrder, updateStatus } = useOrderStore();

  if (!order) {
    return <Card pad className="py-12 text-center text-sm text-text-2">{t("notFound")}</Card>;
  }

  const next = nextStatusFor(order.status);
  const decision = next
    ? canTransition({ from: order.status, to: next, paymentMethod: order.paymentMethod })
    : null;

  const onNext = () => {
    if (!next) return;
    if (next === "AWAITING_PAYMENT") {
      confirmOrder(order.id);
      return;
    }
    updateStatus(order.id, next);
  };

  const steps = ORDER_STATUS_CHAIN.map((s, i) => {
    const currentIndex = ORDER_STATUS_CHAIN.indexOf(order.status);
    return { s, done: i < currentIndex, active: i === currentIndex };
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <Card pad>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono lat text-xs text-text-2">{order.id}</p>
              <p className="mt-1 text-sm font-medium">{order.customerName}</p>
            </div>
            <Badge variant={STATUS_VARIANT[order.status]}>{t(`status.${order.status}`)}</Badge>
          </div>

          {/* trace */}
          <div className="mt-6 flex items-center gap-1.5" aria-label={t("trace")}>
            {steps.map((step, i) => (
              <div key={i} className="flex flex-1 items-center gap-1.5">
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[10px]",
                    step.active
                      ? "border-copper bg-chip text-copper"
                      : step.done
                        ? "border-mint bg-mint/15 text-mint"
                        : "border-line-soft text-text-2",
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    "h-0.5 flex-1",
                    step.done ? "bg-mint" : i < ORDER_STATUS_CHAIN.length - 1 ? "bg-line-soft" : "bg-transparent",
                  )}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-text-2">
            {ORDER_STATUS_CHAIN.map((s) => (
              <span key={s}>{t(`status.${s}`)}</span>
            ))}
          </div>
        </Card>

        <Card pad>
          <h3 className="mb-2 text-sm font-medium">{t("line")}</h3>
          <ul className="divide-y divide-dashed divide-line-soft">
            {order.items.map((line) => (
              <li key={line.productId} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="mono lat block text-[11px] text-text-2">{line.sku}</span>
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
        </Card>
      </div>

      <div className="space-y-4">
        <Card pad>
          <h3 className="mb-3 text-sm font-medium">{t("paymentCode")}</h3>
          {order.paymentCode ? (
            <>
              <PaymentQr value={order.paymentCode.code} label={order.paymentCode.code} />
              <div className="mt-3 text-center text-xs text-text-2">
                <span className="mono lat block text-base tracking-[0.14em] text-mint">
                  {order.paymentCode.code}
                </span>
                <span className="mt-1 block">
                  {order.paymentCode.status === "ACTIVE" ? "active" : order.paymentCode.status.toLowerCase()}
                </span>
              </div>
            </>
          ) : canUsePaymentCode(order.paymentMethod) ? (
            <p className="text-xs text-text-2">{t("codeRevealedOnConfirm")}</p>
          ) : (
            <p className="text-xs text-text-2">{t(`paymentMethods.${order.paymentMethod}_desc`)}</p>
          )}
        </Card>

        <Card pad>
          <Button className="w-full" disabled={!next || decision?.ok !== true} onClick={onNext}>
            {decision?.ok === false && decision.reason === "unpaid-preparation"
              ? t("markPaidFirst")
              : next
                ? t(`nextAction.${next}`)
                : t("delivered")}
          </Button>
        </Card>
      </div>
    </div>
  );
}