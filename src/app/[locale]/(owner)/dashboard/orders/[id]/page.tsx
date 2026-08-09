import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { OwnerOrderDetail } from "@/components/owner/OwnerOrderDetail";

export default async function OwnerOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireAdmin();
  setRequestLocale(locale);
  const t = await getTranslations("Orders");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
          <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-copper" />
          <span className="mono lat text-base text-text-2">{id}</span>
        </h1>
        <p className="mt-1 text-[13px] text-text-2">{t("trace")}</p>
        <TraceDivider />
      </div>
      <OwnerOrderDetail orderId={id} />
    </div>
  );
}