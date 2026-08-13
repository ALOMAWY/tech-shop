"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { createCustomer } from "@/features/customers/server";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type ActionError = {
  email?: string[];
  password?: string[];
  _errors?: string[];
} | null;

export function CreateCustomerForm() {
  const t = useTranslations("Customers");
  const router = useRouter();
  const [error, setError] = useState<ActionError>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCustomer(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/customers");
    }
  };

  return (
    <Card pad className="mx-auto max-w-[480px]">
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
            placeholder="customer@example.com"
          />
          {error?.email && (
            <p className="mt-1 text-xs text-red">{error.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            {t("password")}
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
          />
          {error?.password && (
            <p className="mt-1 text-xs text-red">{error.password[0]}</p>
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
            placeholder={t("addressPlaceholder")}
          />
        </div>

        {error?._errors && (
          <p className="text-xs text-red">{error._errors[0]}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? t("creating") : t("create")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
          >
            {t("cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
}