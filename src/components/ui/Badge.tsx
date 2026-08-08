import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant = "ok" | "warn" | "danger" | "blue" | "purple" | "pink" | "copper";

const VARIANTS: Record<BadgeVariant, string> = {
  ok: "bg-chip-mint text-mint before:bg-mint",
  warn: "bg-chip-amber text-amber before:bg-amber",
  danger: "bg-chip-red text-red before:bg-red",
  blue: "bg-chip-blue text-blue before:bg-blue",
  purple: "bg-chip-purple text-purple before:bg-purple",
  pink: "bg-chip-pink text-pink before:bg-pink",
  copper: "bg-chip text-copper before:bg-copper",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "ok", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2.5 py-0.5 text-xs font-medium",
        "before:h-[5px] before:w-[5px] before:shrink-0 before:rounded-full before:content-['']",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}