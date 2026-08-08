"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { type Product } from "@/features/products/mock";
import { useCart } from "@/features/cart/store";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const isLowStock = product.quantity < 500;

  return (
    <Card className="flex flex-col p-4 transition-colors hover:border-line">
      <span className="mono lat text-[11px] text-text-2 ltr text-right">{product.sku}</span>
      <div className="my-3 flex h-24 items-center justify-center rounded-[6px] border border-dashed border-line bg-surface-2 text-[12px] text-text-2">
        {product.name.slice(0, 10)}
      </div>
      <h3 className="text-[15px] font-medium leading-normal">{product.name}</h3>
      <p className="mt-1 text-[12.5px] text-text-2">{product.features.join(" · ")}</p>
      
      <div className="mt-auto flex items-baseline justify-between pt-3">
        <span className="mono lat text-lg font-medium ltr">
          {product.price.toFixed(2)} <small className="text-[11px] font-normal text-text-2">د.ع</small>
        </span>
        <Badge variant={isLowStock ? "warn" : "ok"}>
          {isLowStock ? `LOW-${product.quantity}` : `IN-${product.quantity}`}
        </Badge>
      </div>
      
      <button 
        onClick={() => addItem(product)}
        className="mt-3 w-full rounded-[6px] border border-line bg-transparent py-2 text-[13.5px] font-medium text-copper transition-colors hover:bg-copper hover:text-on-accent focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2"
      >
        إضافة إلى السلة
      </button>
    </Card>
  );
}