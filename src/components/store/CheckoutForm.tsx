"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { QrCode, Bank, HandCoins } from "@phosphor-icons/react";
import { useCart } from "@/features/cart/store";
import { useOrderStore } from "@/features/orders/orders-store";
import { orderTotal } from "@/features/orders/mock";
import type { PaymentMethod } from "@/features/orders/types";
import { Card } from "@/components/ui/Card";
import { Button, buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Link } from "@/i18n/navigation";

const METHODS: {
  id: PaymentMethod;
  icon: typeof QrCode;
}[] = [
  { id: "SHAM_CASH_QR", icon: QrCode },
  { id: "PREPAID", icon: Bank },
  { id: "COD", icon: HandCoins },
];

export function CheckoutForm() {
  const t = useTranslations("Orders");
  const { items, clearCart } = useCart();
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const [method, setMethod] = useState<PaymentMethod>("SHAM_CASH_QR");
  const [placedId, setPlacedId] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      items.map((i) => ({
        productId: i.product.id,
        sku: i.product.sku,
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
    [items],
  );

  const summary = useMemo(() => orderTotal(lines, method, null), [lines, method]);

  if (placedId) {
    return (
      <Card pad className="mx-auto max-w-[480px] border-copper/30 bg-surface text-center">
        <p className="display text-xl font-medium">✓</p>
        <h2 className="display mt-3 text-lg font-medium">{t("checkout.placed")}</h2>
        <p className="mt-2 text-sm text-text-2">{t("checkout.placedNote", { id: placedId })}</p>
        <Link href={`/orders/${placedId}`} className={buttonClasses("copper", "mt-6")}>
          {t("checkout.viewOrder")}
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <Card pad>
          <h3 className="mb-1 text-[15px] font-medium">{t("checkout.method")}</h3>
          <p className="mb-4 text-xs text-text-2">{t("checkout.methodNote")}</p>
          <div className="grid gap-2.5">
            {METHODS.map(({ id, icon: Icon }) => {
              const active = method === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-3 rounded-[6px] border bg-bg px-4 py-3 text-start transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2",
                    active ? "border-copper/60 bg-chip" : "border-line-soft hover:border-copper/40",
                  )}
                >
                  <Icon size={20} className={cn(active ? "text-copper" : "text-text-2")} weight="duotone" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{t(`paymentMethods.${id}`)}</span>
                    <span className="block text-xs text-text-2">{t(`paymentMethods.${id}_desc`)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div>
        <Card pad>
          <h3 className="mb-3 text-[15px] font-medium">{t("checkout.summary")}</h3>
          <ul className="divide-y divide-dashed divide-line-soft">
            {lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate">{line.name}</span>
                  <span className="mono lat block text-xs text-text-2">×{line.quantity}</span>
                </span>
                <span className="mono lat text-sm">{(line.price * line.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          {summary.discountAmount > 0 ? (
            <div className="flex justify-between pt-2 text-sm text-mint">
              <span>{t("discount")}</span>
              <span className="mono lat">−{summary.discountAmount.toFixed(2)}</span>
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
            <span className="text-sm font-medium">{t("total")}</span>
            <span className="mono lat text-lg text-copper">{summary.total.toFixed(2)}</span>
          </div>

          <Button
            className="mt-5 w-full"
            disabled={lines.length === 0}
            onClick={() => {
              const order = placeOrder({
                customerId: "customer-demo",
                customerName: "زبون تجريبي",
                lines,
                paymentMethod: method,
              });
              clearCart();
              setPlacedId(order.id);
            }}
          >
            {t("checkout.place")}
          </Button>
          <Link href="/" className="mt-3 block text-center text-xs text-text-2 hover:text-copper">
            ← {t("checkout.backToCatalog")}
          </Link>
        </Card>
      </div>
    </div>
  );
}