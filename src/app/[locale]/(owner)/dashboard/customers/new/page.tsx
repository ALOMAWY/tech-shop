import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { CreateCustomerForm } from "@/components/owner/CreateCustomerForm";

export default async function NewCustomerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin();
  setRequestLocale(locale);
  const t = await getTranslations("Customers");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
          <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
          {t("createNew")}
        </h1>
        <TraceDivider className="mt-3" />
      </div>
      <CreateCustomerForm />
    </div>
  );
}