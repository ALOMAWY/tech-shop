"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toggleDiscount, deleteDiscount } from "@/features/discounts/server";
import { formatCurrency } from "@/lib/format";
import type { DiscountType } from "@prisma/client";

export type DiscountDto = {
  id: string;
  code: string;
  type: DiscountType;
  value: string;
  expiry: string | null;
  active: boolean;
  createdAt: string;
  productNames: string[];
  customerEmails: string[];
};

export function DiscountList({ discounts }: { discounts: DiscountDto[] }) {
  const t = useTranslations("Discounts");
  const [busy, setBusy] = useState<string | null>(null);

  const handleToggle = async (id: string, active: boolean) => {
    setBusy(id);
    await toggleDiscount(id, active);
    setBusy(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    setBusy(id);
    await deleteDiscount(id);
    setBusy(null);
  };

  if (discounts.length === 0) {
    return (
      <Card pad className="py-12 text-center text-sm text-text-2">
        {t("empty")}
      </Card>
    );
  }

  const isExpired = (expiry: string | null) => expiry !== null && new Date(expiry).getTime() < Date.now();

  return (
    <div className="space-y-3">
      {discounts.map((d) => {
        const expired = isExpired(d.expiry);
        return (
          <Card key={d.id} pad className="flex flex-wrap items-center gap-4">
            <div className="min-w-[160px] flex-1">
              <p className="mono text-sm font-medium text-copper">{d.code}</p>
              <p className="mt-0.5 text-xs text-text-2">
                {d.type === "PERCENT"
                  ? `${d.value}%`
                  : formatCurrency(d.value)}
              </p>
            </div>

            <div className="flex max-w-[320px] flex-1 flex-wrap gap-1.5">
              {d.productNames.length === 0 ? (
                <Badge variant="blue">{t("allProducts")}</Badge>
              ) : (
                d.productNames.slice(0, 3).map((name) => (
                  <Badge key={name} variant="blue">
                    {name}
                  </Badge>
                ))
              )}
            </div>

            <div className="flex max-w-[240px] flex-1 flex-wrap gap-1.5">
              {d.customerEmails.length === 0 ? (
                <Badge variant="purple">{t("allCustomers")}</Badge>
              ) : (
                d.customerEmails.slice(0, 2).map((email) => (
                  <Badge key={email} variant="purple">
                    {email}
                  </Badge>
                ))
              )}
            </div>

            {d.expiry && (
              <span className="mono text-xs text-text-2">
                {t("expiry")}: {new Date(d.expiry).toLocaleDateString("ar-IQ")}
              </span>
            )}

            {expired ? (
              <Badge variant="danger">{t("expired")}</Badge>
            ) : d.active ? (
              <Badge variant="ok">{t("active")}</Badge>
            ) : (
              <Badge variant="warn">{t("inactive")}</Badge>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-xs"
                disabled={busy === d.id || expired}
                onClick={() => handleToggle(d.id, !d.active)}
              >
                {t("toggle")}
              </Button>
              <Button
                variant="ghost"
                className="text-xs text-red hover:text-red"
                disabled={busy === d.id}
                onClick={() => handleDelete(d.id)}
              >
                {t("delete")}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}