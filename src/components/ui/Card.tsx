import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  pad?: boolean;
};

export function Card({ pad = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[6px] border border-line-soft bg-surface",
        "before:absolute before:inset-inline-start-0 before:top-0 before:h-[8px] before:w-[22px] before:rounded-br-[6px] before:bg-copper before:content-['']",
        pad && "p-4",
        className,
      )}
      {...props}
    />
  );
}