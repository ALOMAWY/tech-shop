import { setRequestLocale } from "next-intl/server";
import { Topbar } from "@/components/shared/Topbar";
import { Hero } from "@/components/shared/Hero";
import { Footer } from "@/components/shared/Footer";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CatalogSection } from "@/components/store/CatalogSection";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/features/products/mock";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-[1120px] flex-1 px-5">
        <Hero />
        <TraceDivider />
        <SectionTitle namespace="Catalog" titleKey="sectionTitle" noteKey="sectionNote" pad="blue" />
        <CatalogSection categories={MOCK_CATEGORIES} products={MOCK_PRODUCTS} />
      </main>
      <Footer />
    </>
  );
}