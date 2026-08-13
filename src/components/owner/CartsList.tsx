"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { sendReadyCart, deleteCart } from "@/features/carts/server";
import { formatCurrency, formatDateTime } from "@/lib/format";

export type CartDto = {
  id: string;
  customerEmail: string;
  isReady: boolean;
  adjusted: boolean;
  sentAt: string | null;
  createdAt: string;
  items: { id: string; productName: string; quantity: number; price: string }[];
  total: number;
};

export function CartsList({ carts }: { carts: CartDto[] }) {
  const t = useTranslations("Carts");
  const [busy, setBusy] = useState<string | null>(null);

  const handleSend = async (id: string) => {
    setBusy(id);
    await sendReadyCart(id);
    setBusy(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setBusy(id);
    await deleteCart(id);
    setBusy(null);
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
        <Card key={cart.id} pad className="flex flex-wrap items-center gap-4">
          <div className="min-w-[180px] flex-1">
            <p className="text-sm font-medium">{cart.customerEmail}</p>
            <p className="mono mt-0.5 text-xs text-text-2">
              {formatDateTime(cart.createdAt)}
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-1">
            {cart.items.map((item) => (
              <p key={item.id} className="text-xs text-text-2">
                {item.productName} × {item.quantity}
              </p>
            ))}
          </div>

          <span className="mono text-sm">{formatCurrency(cart.total)}</span>

          {cart.isReady ? (
            <Badge variant="ok">{t("sent")}</Badge>
          ) : (
            <Badge variant="warn">{t("draft")}</Badge>
          )}

          {cart.adjusted && <Badge variant="blue">{t("changed")}</Badge>}

          <div className="flex gap-2">
            {!cart.isReady && (
              <Button
                variant="mint"
                className="text-xs"
                disabled={busy === cart.id}
                onClick={() => handleSend(cart.id)}
              >
                {t("sendReady")}
              </Button>
            )}
            <Button
              variant="ghost"
              className="text-xs text-red hover:text-red"
              disabled={busy === cart.id}
              onClick={() => handleDelete(cart.id)}
            >
              {t("delete")}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}