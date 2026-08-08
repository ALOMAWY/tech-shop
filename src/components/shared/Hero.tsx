import { useTranslations } from "next-intl";

const LED_COLORS = ["var(--copper)", "var(--mint)", "var(--blue)", "var(--amber)", "var(--purple)", "var(--pink)", "var(--red)"];

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="px-5 pt-16 pb-2">
      <h1 className="display max-w-3xl text-[clamp(28px,5vw,44px)] font-medium leading-tight tracking-wide">
        {t("title")} <span className="text-copper">{t("titleAccent")}</span>
      </h1>
      <p className="mt-3 max-w-[56ch] text-[15px] text-text-2">{t("lead")}</p>
      <div aria-hidden className="flex gap-2 pt-4">
        {LED_COLORS.map((c) => (
          <i
            key={c}
            className="h-[10px] w-[10px] rounded-full transition-transform duration-200 hover:scale-[1.4]"
            style={{ background: c, color: c, boxShadow: "0 0 10px currentColor" }}
          />
        ))}
      </div>
    </section>
  );
}