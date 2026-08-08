import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

type SectionTitleProps = {
  namespace: string;
  titleKey: string;
  noteKey?: string;
  pad?: "copper" | "amber" | "blue" | "mint" | "purple";
  className?: string;
};

const PADS: Record<NonNullable<SectionTitleProps["pad"]>, string> = {
  copper: "bg-copper",
  amber: "bg-amber",
  blue: "bg-blue",
  mint: "bg-mint",
  purple: "bg-purple",
};

export function SectionTitle({ namespace, titleKey, noteKey, pad = "copper", className }: SectionTitleProps) {
  const t = useTranslations(namespace);
  return (
    <div className={cn("mb-5", className)}>
      <h2 className="display flex items-center gap-2.5 text-[22px] font-medium leading-snug">
        <span aria-hidden className={cn("inline-block h-[18px] w-[8px] rounded-[3px]", PADS[pad])} />
        {t(titleKey)}
      </h2>
      {noteKey ? <p className="mt-1 text-[13px] text-text-2">{t(noteKey)}</p> : null}
    </div>
  );
}