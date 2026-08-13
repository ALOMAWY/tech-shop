import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { getCustomer } from "@/features/customers/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { CustomerEditForm } from "@/components/owner/CustomerEditForm";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { formatDateTime, formatCurrency } from "@/lib/format";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireAdmin();
  setRequestLocale(locale);
  const t = await getTranslations("Customers");

  const customer = await getCustomer(id);
  if (!customer) notFound();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
            <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
            {customer.email}
          </h1>
          <TraceDivider className="mt-3" />
        </div>
        <Link href="/dashboard/customers" className={buttonClasses("ghost", "text-sm")}>
          {t("backToCustomers")}
        </Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card pad>
          <h2 className="text-sm font-medium text-text-2">{t("details")}</h2>
          <div className="mt-4 flex flex-wrap gap-6 text-sm">
            <div>
              <p className="text-xs text-text-2">{t("rating")}</p>
              <p className="mono mt-1 text-amber">{customer.rating.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-text-2">{t("trust")}</p>
              <p className="mono mt-1 text-mint">{customer.trustScore}</p>
            </div>
            <div>
              <p className="text-xs text-text-2">{t("createdAt")}</p>
              <p className="mono mt-1">{formatDateTime(customer.createdAt)}</p>
            </div>
            <div>
              {customer.isBlocked ? (
                <Badge variant="danger">{t("blocked")}</Badge>
              ) : (
                <Badge variant="ok">{t("active")}</Badge>
              )}
            </div>
          </div>
        </Card>

        <Card pad>
          <h2 className="text-sm font-medium text-text-2">{t("edit")}</h2>
          <div className="mt-4">
            <CustomerEditForm customer={customer} />
          </div>
        </Card>
      </div>

      <Card pad>
        <h2 className="text-sm font-medium text-text-2">{t("recentOrders")}</h2>
        {customer.orders.length === 0 ? (
          <p className="mt-4 text-sm text-text-2">{t("noOrders")}</p>
        ) : (
          <div className="mt-4 divide-y divide-line">
            {customer.orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 text-sm">
                <span className="mono">{order.id.slice(0, 8)}</span>
                <span>{order.status}</span>
                <span className="mono">{formatCurrency(order.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}