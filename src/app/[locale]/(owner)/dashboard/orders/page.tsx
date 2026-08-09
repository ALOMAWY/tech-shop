import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { OwnerOrderList } from "@/components/owner/OwnerOrderList";

export default async function OwnerOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin();
  setRequestLocale(locale);
  const t = await getTranslations("Orders");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
          <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-copper" />
          {t("title")}
        </h1>
        <TraceDivider />
      </div>
      <OwnerOrderList />
    </div>
  );
}