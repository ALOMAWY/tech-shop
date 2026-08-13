import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { CreateCartForm } from "@/components/owner/CreateCartForm";
import { getCartFormData } from "@/features/carts/server";

export default async function NewCartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin();
  setRequestLocale(locale);
  const t = await getTranslations("Carts");

  const { products, customers } = await getCartFormData();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
          <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
          {t("createNew")}
        </h1>
        <TraceDivider className="mt-3" />
      </div>
      <CreateCartForm products={products} customers={customers} />
    </div>
  );
}