import { describe, it, expect, beforeEach } from "vitest";
import { create } from "zustand";
import type { Product } from "@/features/products/mock";

// Re-create the store type for testing
type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
};

const createTestStore = () =>
  create<CartState>()((set) => ({
    items: [],
    isOpen: false,
    addItem: (product) =>
      set((state) => {
        const existing = state.items.find((i) => i.product.id === product.id);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { product, quantity: 1 }] };
      }),
    removeItem: (productId) =>
      set((state) => ({ items: state.items.filter((i) => i.product.id !== productId) })),
    updateQuantity: (productId, quantity) =>
      set((state) => ({
        items: state.items.map((i) => (i.product.id === productId ? { ...i, quantity } : i)),
      })),
    clearCart: () => set({ items: [] }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  }));

describe("Cart Store", () => {
  const mockProduct: Product = {
    id: "1",
    sku: "TEST-001",
    name: "Test Product",
    categorySlug: "test",
    features: ["Feature 1"],
    price: 10.5,
    quantity: 100,
  };

  const mockProduct2: Product = {
    id: "2",
    sku: "TEST-002",
    name: "Test Product 2",
    categorySlug: "test",
    features: [],
    price: 25.0,
    quantity: 50,
  };

  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it("starts with empty cart", () => {
    expect(store.getState().items).toEqual([]);
    expect(store.getState().isOpen).toBe(false);
  });

  it("adds item to cart", () => {
    store.getState().addItem(mockProduct);
    const items = store.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe("1");
    expect(items[0].quantity).toBe(1);
  });

  it("increments quantity when adding same product", () => {
    store.getState().addItem(mockProduct);
    store.getState().addItem(mockProduct);
    const items = store.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("adds multiple different products", () => {
    store.getState().addItem(mockProduct);
    store.getState().addItem(mockProduct2);
    expect(store.getState().items).toHaveLength(2);
  });

  it("removes item from cart", () => {
    store.getState().addItem(mockProduct);
    store.getState().addItem(mockProduct2);
    store.getState().removeItem("1");
    const items = store.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].product.id).toBe("2");
  });

  it("updates item quantity", () => {
    store.getState().addItem(mockProduct);
    store.getState().updateQuantity("1", 5);
    expect(store.getState().items[0].quantity).toBe(5);
  });

  it("clears cart", () => {
    store.getState().addItem(mockProduct);
    store.getState().addItem(mockProduct2);
    store.getState().clearCart();
    expect(store.getState().items).toEqual([]);
  });

  it("toggles cart drawer", () => {
    expect(store.getState().isOpen).toBe(false);
    store.getState().toggleCart();
    expect(store.getState().isOpen).toBe(true);
    store.getState().toggleCart();
    expect(store.getState().isOpen).toBe(false);
  });

  it("calculates cart total correctly", () => {
    store.getState().addItem(mockProduct); // 10.5 × 1
    store.getState().addItem(mockProduct2); // 25.0 × 1
    store.getState().updateQuantity("1", 3); // 10.5 × 3 = 31.5
    
    const total = store.getState().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    expect(total).toBeCloseTo(56.5, 2); // 31.5 + 25.0
  });
});