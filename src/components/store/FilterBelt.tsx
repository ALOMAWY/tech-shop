"use client";

import { cn } from "@/lib/cn";
import { type Category } from "@/features/products/mock";

type FilterBeltProps = {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
};

const DOT_COLORS: Record<Category["color"], string> = {
  copper: "bg-copper",
  mint: "bg-mint",
  blue: "bg-blue",
  purple: "bg-purple",
};

export function FilterBelt({ categories, activeSlug, onSelect }: FilterBeltProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="tablist">
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onSelect(cat.slug)}
          className={cn(
            "cursor-pointer rounded-[6px] border border-line-soft bg-surface p-3 text-right transition-[border-color,background] duration-200",
            activeSlug === cat.slug && "border-copper bg-chip",
          )}
          role="tab"
          aria-selected={activeSlug === cat.slug}
        >
          <span className="flex items-center gap-2 font-medium text-sm">
            <i className={cn("h-[7px] w-[7px] shrink-0 rounded-full", DOT_COLORS[cat.color])} />
            {cat.name}
          </span>
          <span className="mono lat mt-1 block text-[11px] text-text-2 ltr text-right">
            {cat.count.toString().padStart(3, "0")} items
          </span>
        </button>
      ))}
    </div>
  );
}