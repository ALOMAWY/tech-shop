"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { adjustCartItemQuantity } from "@/features/carts/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/format";

export type MyCartDto = {
  id: string;
  sentAt: string | null;
  adjusted: boolean;
  items: { id: string; productName: string; quantity: number; price: string }[];
  total: number;
};

export function MyCartsList({ carts }: { carts: MyCartDto[] }) {
  const t = useTranslations("Carts");
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const handleAdjust = async (cartId: string, itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setBusy(itemId);
    await adjustCartItemQuantity(cartId, itemId, quantity);
    setBusy(null);
    router.refresh();
  };

  if (carts.length === 0) {
    return (
      <Card pad className="py-12 text-center text-sm text-text-2">
        {t("empty")}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {carts.map((cart) => (
        <Card key={cart.id} pad>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {cart.sentAt && (
              <span className="text-xs text-text-2">{formatDateTime(cart.sentAt)}</span>
            )}
            <Badge variant="ok">{t("sent")}</Badge>
          </div>

          <div className="mt-3 divide-y divide-line-soft">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="flex-1">{item.productName}</span>
                <span className="mono text-xs text-text-2">{formatCurrency(item.price)}</span>
                <span className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    disabled={busy === item.id}
                    onClick={() => handleAdjust(cart.id, item.id, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="mono min-w-6 text-center">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    className="px-2 py-1 text-xs"
                    disabled={busy === item.id}
                    onClick={() => handleAdjust(cart.id, item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line-soft pt-3">
            <span className="text-sm text-text-2">{t("total")}</span>
            <span className="mono text-sm">{formatCurrency(cart.total)}</span>
          </div>

          {cart.adjusted && (
            <p className="mt-2 text-xs text-blue">{t("changed")}</p>
          )}
        </Card>
      ))}
    </div>
  );
}