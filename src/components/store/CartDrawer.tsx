"use client";

import { useCart } from "@/features/cart/store";
import { Modal } from "@/components/ui/Modal";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

export function CartDrawer() {
  const { items, isOpen, toggleCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <Modal open={isOpen} onClose={toggleCart} title="السلة" className="p-0">
      <div className="p-6">
        {items.length === 0 ? (
          <p className="py-10 text-center text-text-2">السلة فارغة</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between border-b border-dashed border-line-soft pb-3 text-sm">
                <span>{item.product.name} <span className="mono lat text-xs text-text-2">×{item.quantity}</span></span>
                <span className="mono lat">{ (item.product.price * item.quantity).toFixed(2) }</span>
              </div>
            ))}
            <div className="flex justify-between pt-3 font-medium">
              <span>المجموع الكلي</span>
              <span className="mono lat text-lg">{total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-line-soft bg-surface p-6">
        <div className="trace-flow relative mb-4">
          <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="h-[40px] w-full">
            <path className="path-bg" d="M10 20 H390" />
            <path className="path-anim" id="tracePath" d="M10 20 H390" />
            <circle className="node" cx="10" cy="20" r="4" />
            <circle className="node" cx="390" cy="20" r="4" />
          </svg>
        </div>
        <Link href="/checkout" onClick={toggleCart} className={buttonClasses("copper", "w-full")}>
          إتمام الدفع
        </Link>
      </div>
    </Modal>
  );
}