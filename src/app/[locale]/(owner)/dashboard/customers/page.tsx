import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { CustomerList } from "@/components/owner/CustomerList";
import { getCustomers } from "@/features/customers/server";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin();
  setRequestLocale(locale);
  const t = await getTranslations("Customers");

  const customers = await getCustomers();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
            <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
            {t("title")}
          </h1>
          <TraceDivider className="mt-3" />
        </div>
        <Link href="/dashboard/customers/new" className={buttonClasses("mint")}>
          {t("createNew")}
        </Link>
      </div>
      <CustomerList customers={customers} />
    </div>
  );
}