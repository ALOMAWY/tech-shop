import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Shell");

  return (
    <footer className="mt-20 border-t border-line-soft pb-10 pt-6">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-2.5 px-5 text-xs text-text-2">
        <span>{t("footerName")}</span>
        <span className="mono lat">{t("footerRev")}</span>
      </div>
    </footer>
  );
}