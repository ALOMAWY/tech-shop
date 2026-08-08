import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Topbar } from "@/components/shared/Topbar";
import { Hero } from "@/components/shared/Hero";
import { Footer } from "@/components/shared/Footer";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Catalog");

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-[1120px] flex-1 px-5">
        <Hero />
        <TraceDivider />
        <SectionTitle namespace="Catalog" titleKey="sectionTitle" noteKey="sectionNote" pad="blue" />
        <Card pad className="grid place-items-center py-16 text-center">
          <p className="max-w-sm text-[15px] text-text-2">{t("comingSoon")}</p>
        </Card>
      </main>
      <Footer />
    </>
  );
}