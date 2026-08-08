"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login, type LoginState } from "@/features/auth/server";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export function LoginForm({ next }: { next?: string }) {
  const t = useTranslations("Auth");

  async function handleSubmit(prev: LoginState, formData: FormData): Promise<LoginState> {
    if (next) formData.append("next", next);
    return login(prev, formData);
  }

  const [state, formAction, pending] = useActionState(handleSubmit, undefined);

  return (
    <form action={formAction} noValidate>
      <Field label={t("email")} htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder={t("emailPlaceholder")} />
      </Field>
      <Field label={t("password")} htmlFor="password">
        <Input id="password" name="password" type="password" required autoComplete="current-password" placeholder={t("passwordPlaceholder")} />
      </Field>

      {state?.error ? (
        <p role="alert" className="mb-3 rounded bg-chip-red px-3 py-2 text-[13px] text-red">
          {t("error")}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("loading") : t("submit")}
      </Button>

      <p className="mt-2 text-xs text-text-2">
        {t("hint")} — <span className="mono lat ltr text-copper">{t("ownerFlag")}</span>
      </p>
    </form>
  );
}