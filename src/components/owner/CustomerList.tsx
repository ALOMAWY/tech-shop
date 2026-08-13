"use client";

import { useTranslations } from "next-intl";
import type { User } from "@prisma/client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { blockCustomer, unblockCustomer } from "@/features/customers/server";
import { useState } from "react";

type CustomerListProps = {
  customers: Array<
    Pick<User, "id" | "email" | "address" | "rating" | "isBlocked" | "createdAt"> & {
      trustScore: number;
      _count: { orders: number };
    }
  >;
};

export function CustomerList({ customers }: CustomerListProps) {
  const t = useTranslations("Customers");
  const [loading, setLoading] = useState<string | null>(null);

  const handleBlock = async (id: string) => {
    setLoading(id);
    await blockCustomer(id);
    setLoading(null);
  };

  const handleUnblock = async (id: string) => {
    setLoading(id);
    await unblockCustomer(id);
    setLoading(null);
  };

  if (customers.length === 0) {
    return (
      <Card pad className="py-12 text-center text-sm text-text-2">
        {t("empty")}
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <Card key={customer.id} pad className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px] flex-1">
            <p className="text-sm font-medium">{customer.email}</p>
            {customer.address && (
              <p className="mt-0.5 text-xs text-text-2">{customer.address}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-2">{t("rating")}:</span>
            <span className="mono text-sm text-amber">{customer.rating.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-2">{t("trust")}:</span>
            <span className="mono text-sm text-mint">{customer.trustScore}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-2">{t("orders")}:</span>
            <span className="mono text-sm">{customer._count.orders}</span>
          </div>

          {customer.isBlocked ? (
            <Badge variant="danger">{t("blocked")}</Badge>
          ) : (
            <Badge variant="ok">{t("active")}</Badge>
          )}

          <div className="flex gap-2">
            <Link href={`/dashboard/customers/${customer.id}`} className={buttonClasses("ghost", "text-xs")}>
              {t("view")}
            </Link>
            {customer.isBlocked ? (
              <Button
                variant="mint"
                className="text-xs"
                onClick={() => handleUnblock(customer.id)}
                disabled={loading === customer.id}
              >
                {t("unblock")}
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="text-xs text-red hover:text-red"
                onClick={() => handleBlock(customer.id)}
                disabled={loading === customer.id}
              >
                {t("block")}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}