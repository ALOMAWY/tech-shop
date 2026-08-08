"use client";

import { useState } from "react";
import { FilterBelt } from "@/components/store/FilterBelt";
import { ProductCard } from "@/components/store/ProductCard";
import { type Category, type Product } from "@/features/products/mock";

type CatalogSectionProps = {
  categories: Category[];
  products: Product[];
};

export function CatalogSection({ categories, products }: CatalogSectionProps) {
  const [activeSlug, setActiveSlug] = useState(categories[0].slug);
  const filteredProducts = products.filter((p) => p.categorySlug === activeSlug);

  return (
    <>
      <FilterBelt categories={categories} activeSlug={activeSlug} onSelect={setActiveSlug} />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}