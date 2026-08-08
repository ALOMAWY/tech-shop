import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Topbar } from "@/components/shared/Topbar";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Auth");

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />
      <main className="flex flex-1 items-start justify-center px-5 py-14">
        <Card className="max-w-[420px] p-6">
          <h1 className="display text-xl font-medium">{t("title")}</h1>
          <p className="mt-1 text-sm text-text-2">{t("subtitle")}</p>
          <div className="mt-5">
            <LoginForm next={next} />
          </div>
        </Card>
      </main>
    </div>
  );
}