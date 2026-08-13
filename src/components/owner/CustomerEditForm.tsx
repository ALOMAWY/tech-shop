"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { updateCustomer } from "@/features/customers/server";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type Customer = {
  id: string;
  email: string;
  address: string | null;
  rating: number;
};

type ActionError = {
  email?: string[];
  _errors?: string[];
} | null;

export function CustomerEditForm({ customer }: { customer: Customer }) {
  const t = useTranslations("Customers");
  const router = useRouter();
  const [error, setError] = useState<ActionError>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateCustomer(customer.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.refresh();
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          {t("email")}
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={customer.email}
        />
        {error?.email && (
          <p className="mt-1 text-xs text-red">{error.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium">
          {t("address")}
        </label>
        <Input
          id="address"
          name="address"
          type="text"
          defaultValue={customer.address ?? ""}
          placeholder={t("addressPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="rating" className="mb-1 block text-sm font-medium">
          {t("rating")}
        </label>
        <Input
          id="rating"
          name="rating"
          type="number"
          min={0}
          max={5}
          step={0.1}
          defaultValue={customer.rating}
        />
      </div>

      {error?._errors && (
        <p className="text-xs text-red">{error._errors[0]}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? t("saving") : t("save")}
        </Button>
      </div>
    </form>
  );
}