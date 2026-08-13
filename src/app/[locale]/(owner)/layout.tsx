import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/guards";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", key: "dashboard" },
  { href: "/dashboard/products", key: "products" },
  { href: "/dashboard/customers", key: "customers" },
  { href: "/dashboard/orders", key: "orders" },
  { href: "/dashboard/discounts", key: "discounts" },
  { href: "/dashboard/messages", key: "messages" },
  { href: "/dashboard/carts", key: "carts" },
];

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const t = await getTranslations("Dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-e border-line-soft bg-surface/60 p-4">
        <div className="mb-6 flex items-center gap-2">
          <span className="mono lat grid h-[30px] w-[30px] place-items-center rounded-[6px] border-2 border-copper text-[13px] font-medium text-copper">
            {"TS"}
          </span>
          <span className="display text-[16px] font-medium">{t("title")}</span>
        </div>
        <nav className="flex flex-col gap-1" aria-label={t("title")}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[6px] px-3 py-2 text-[14px] text-text-2 transition-colors hover:bg-chip hover:text-copper",
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}