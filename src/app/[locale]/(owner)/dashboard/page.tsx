import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function OwnerDashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="display text-2xl font-medium">{t("welcome")}</h1>
        <Badge variant="purple">owner</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card pad>
          <p className="text-sm text-text-2">M1 · Skeleton</p>
          <p className="mt-1 text-lg font-medium">Auth + Layouts</p>
        </Card>
        <Card pad>
          <p className="text-sm text-text-2">M2 · Catalog</p>
          <p className="mt-1 text-lg font-medium">المنتجات والفلاتر</p>
        </Card>
        <Card pad>
          <p className="text-sm text-text-2">M3 · Payments</p>
          <p className="mt-1 text-lg font-medium">أكواد الدفع</p>
        </Card>
      </div>
    </div>
  );
}