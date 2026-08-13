"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { createReadyCart } from "@/features/carts/server";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Product = { id: string; name: string; price: string; quantity: number };
type Customer = { id: string; email: string };

type ActionError = {
  _errors?: string[];
  customerId?: string[];
} | null;

export function CreateCartForm({
  products,
  customers,
}: {
  products: Product[];
  customers: Customer[];
}) {
  const t = useTranslations("Carts");
  const router = useRouter();
  const [error, setError] = useState<ActionError>(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: "", quantity: 1 },
  ]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.some((i) => !i.productId)) {
      setError({ _errors: [t("selectProducts")] });
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createReadyCart(customerId, items);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/carts");
    }
  };

  const updateItem = (index: number, patch: Partial<{ productId: string; quantity: number }>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <Card pad className="mx-auto max-w-[640px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="customer" className="mb-1 block text-sm font-medium">
            {t("selectCustomer")}
          </label>
          <select
            id="customer"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="w-full rounded-[6px] border border-line-soft bg-bg px-3.5 py-2.5 font-sans text-sm text-text"
          >
            <option value="">…</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.email}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("selectProducts")}</legend>
          {items.map((item, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-text-2">{t("product")}</label>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, { productId: e.target.value })}
                  className="w-full rounded-[6px] border border-line-soft bg-bg px-3.5 py-2.5 font-sans text-sm text-text"
                >
                  <option value="">…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="mb-1 block text-xs text-text-2">{t("quantity")}</label>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, { quantity: Math.max(1, Number(e.target.value) || 1) })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                className="px-3"
                disabled={items.length === 1}
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={() => setItems((prev) => [...prev, { productId: "", quantity: 1 }])}
          >
            + {t("addItem")}
          </Button>
        </fieldset>

        {error?._errors && <p className="text-xs text-red">{error._errors[0]}</p>}
        {error?.customerId && <p className="text-xs text-red">{error.customerId[0]}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("creating") : t("save")}
        </Button>
      </form>
    </Card>
  );
}