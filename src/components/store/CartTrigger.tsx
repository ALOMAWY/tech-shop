"use client";

import { ShoppingCart } from "@phosphor-icons/react";
import { useCart } from "@/features/cart/store";

export function CartTrigger() {
  const { toggleCart, items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={toggleCart}
      className="relative flex h-10 w-10 items-center justify-center rounded-[6px] border border-line bg-chip text-copper transition-transform active:scale-95"
      aria-label="السلة"
    >
      <ShoppingCart size={20} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-copper text-[10px] font-bold text-on-accent">
          {count}
        </span>
      )}
    </button>
  );
}