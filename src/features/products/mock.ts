export type Category = {
  id: string;
  name: string;
  slug: string;
  color: "copper" | "mint" | "blue" | "purple";
  count: number;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  categorySlug: string;
  features: string[];
  price: number;
  quantity: number;
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "إكسسوارات", slug: "accessories", color: "copper", count: 14 },
  { id: "2", name: "أدوات أساسية", slug: "essential-tools", color: "mint", count: 32 },
  { id: "3", name: "قطع صغيرة", slug: "small-parts", color: "blue", count: 87 },
  { id: "4", name: "سماعات / كيبوردات / ماوسات", slug: "audio-kb-mice", color: "purple", count: 21 },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: "1", sku: "SKU-1003-18", name: "مقاومات SMD 0402 — 10kΩ", categorySlug: "small-parts", features: ["تسامح 1%", "عبوة 5000"], price: 18.5, quantity: 4820 },
  { id: "2", sku: "SKU-2041-07", name: "مكثفات سيراميك 0603 — 100nF", categorySlug: "small-parts", features: ["50V", "X7R"], price: 9.75, quantity: 214 },
  { id: "3", sku: "SKU-3110-02", name: "لوحة Arduino Nano", categorySlug: "small-parts", features: ["ATmega328P", "رأس ملحوم"], price: 42.0, quantity: 960 },
  { id: "4", sku: "SKU-4077-31", name: "مفاتيح Toggle SPST", categorySlug: "small-parts", features: ["نحاس مطلي"], price: 13.2, quantity: 1530 },
];