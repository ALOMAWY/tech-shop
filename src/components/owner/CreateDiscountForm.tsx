"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { createDiscount } from "@/features/discounts/server";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Product = { id: string; name: string; price: string };
type Customer = { id: string; email: string };

type ActionError = {
  code?: string[];
  value?: string[];
  _errors?: string[];
} | null;

export function CreateDiscountForm({
  products,
  customers,
}: {
  products: Product[];
  customers: Customer[];
}) {
  const t = useTranslations("Discounts");
  const router = useRouter();
  const [error, setError] = useState<ActionError>(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const result = await createDiscount({
      code: (form.elements.namedItem("code") as HTMLInputElement).value,
      type,
      value: Number((form.elements.namedItem("value") as HTMLInputElement).value),
      expiry: (form.elements.namedItem("expiry") as HTMLInputElement).value || null,
      active: (form.elements.namedItem("active") as HTMLInputElement).checked,
      applicableProducts: selectedProducts,
      applicableCustomers: selectedCustomers,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/discounts");
    }
  };

  const toggleProduct = (id: string) =>
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );

  const toggleCustomer = (id: string) =>
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  return (
    <Card pad className="mx-auto max-w-[640px]">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium">
              {t("code")}
            </label>
            <Input
              id="code"
              name="code"
              required
              minLength={3}
              maxLength={20}
              placeholder="SALE10"
              className="mono uppercase"
            />
            {error?.code && <p className="mt-1 text-xs text-red">{error.code[0]}</p>}
          </div>

          <div>
            <label htmlFor="value" className="mb-1 block text-sm font-medium">
              {t("value")}
            </label>
            <Input
              id="value"
              name="value"
              type="number"
              required
              min={type === "PERCENT" ? 1 : 100}
              max={type === "PERCENT" ? 100 : undefined}
              step="0.01"
            />
            {error?.value && <p className="mt-1 text-xs text-red">{error.value[0]}</p>}
          </div>
        </div>

        <div>
          <p className="mb-1 block text-sm font-medium">{t("type")}</p>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                checked={type === "PERCENT"}
                onChange={() => setType("PERCENT")}
                className="accent-mint"
              />
              {t("PERCENT")}
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                checked={type === "FIXED"}
                onChange={() => setType("FIXED")}
                className="accent-mint"
              />
              {t("FIXED")}
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="expiry" className="mb-1 block text-sm font-medium">
            {t("expiry")}
          </label>
          <Input id="expiry" name="expiry" type="datetime-local" />
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked className="accent-mint" />
          {t("active")}
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("selectProducts")}</legend>
          {products.length === 0 ? (
            <p className="text-xs text-text-2">{t("allProducts")}</p>
          ) : (
            <div className="grid max-h-40 gap-1 overflow-y-auto rounded-[6px] border border-line-soft p-2 sm:grid-cols-2">
              {products.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-chip"
                >
                  <input
                    type="checkbox"
                    className="accent-mint"
                    checked={selectedProducts.includes(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">{t("selectCustomers")}</legend>
          {customers.length === 0 ? (
            <p className="text-xs text-text-2">{t("allCustomers")}</p>
          ) : (
            <div className="grid max-h-40 gap-1 overflow-y-auto rounded-[6px] border border-line-soft p-2 sm:grid-cols-2">
              {customers.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-chip"
                >
                  <input
                    type="checkbox"
                    className="accent-mint"
                    checked={selectedCustomers.includes(c.id)}
                    onChange={() => toggleCustomer(c.id)}
                  />
                  <span className="truncate">{c.email}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {error?._errors && <p className="text-xs text-red">{error._errors[0]}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </Card>
  );
}