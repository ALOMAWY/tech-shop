import { setRequestLocale } from "next-intl/server";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Topbar } from "@/components/shared/Topbar";
import { Footer } from "@/components/shared/Footer";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Topbar />
      <main className="mx-auto max-w-[1120px] flex-1 px-5 pb-14">
        <SectionTitle namespace="Orders" titleKey="title" pad="mint" className="pt-8" />
        <TraceDivider />
        <CheckoutForm />
      </main>
      <Footer />
    </>
  );
}