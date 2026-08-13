"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CartTrigger } from "@/components/store/CartTrigger";
import { ChatsCircle, Package } from "@phosphor-icons/react";

export function Topbar() {
  const t = useTranslations("Shell");

  const iconLink =
    "flex h-10 w-10 items-center justify-center rounded-[6px] border border-line bg-chip text-copper transition-transform active:scale-95";

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5" aria-label={t("brandName")}>
          <span className="mono lat grid h-[30px] w-[30px] place-items-center rounded-[6px] border-2 border-copper text-[13px] font-medium text-copper">
            {t("brandMark")}
          </span>
          <span>
            <span className="display block text-[20px] font-medium tracking-wide leading-6">
              {t("brandName")} <span className="lat text-text-2">/ TechShop</span>
            </span>
            <span className="block text-[11px] leading-3 text-text-2">{t("brandSub")}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2.5">
          <Link href="/carts" className={iconLink} aria-label={t("myCarts")}>
            <Package size={20} />
          </Link>
          <Link href="/messages" className={iconLink} aria-label={t("messages")}>
            <ChatsCircle size={20} />
          </Link>
          <CartTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}