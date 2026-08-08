import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const OWNER_EMAIL = process.env.OWNER_EMAIL ?? "owner@techshop.iq";
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? "Owner-Admin-123";

const CATEGORIES = [
  { name: "إكسسوارات", slug: "accessories", order: 1, color: "copper" },
  { name: "أدوات أساسية", slug: "essential-tools", order: 2, color: "mint" },
  { name: "قطع صغيرة", slug: "small-parts", order: 3, color: "blue" },
  { name: "سماعات / كيبوردات / ماوسات", slug: "audio-kb-mice", order: 4, color: "purple" },
];

const PRODUCTS = [
  { name: "مقاومات SMD 0402 — 10kΩ", category: "small-parts", quantity: 4820, price: "18.50", features: ["تسامح 1%", "عبوة جملة 5000 قطعة"], sku: "SKU-1003-18" },
  { name: "مكثفات سيراميك 0603 — 100nF", category: "small-parts", quantity: 214, price: "9.75", features: ["50V", "استقرار X7R", "علب 1000"], sku: "SKU-2041-07" },
  { name: "لوحة Arduino Nano — نسخة جملة", category: "small-parts", quantity: 960, price: "42.00", features: ["ATmega328P", "رأس ملحوم مسبقاً"], sku: "SKU-3110-02" },
  { name: "مفاتيح Toggle صغيرة SPST", category: "small-parts", quantity: 1530, price: "13.20", features: ["نحاس مطلي", "تشغيل 10000 دورة"], sku: "SKU-4077-31" },
];

async function main() {
  const ownerExists = await prisma.user.findUnique({ where: { email: OWNER_EMAIL ? OWNER_EMAIL : "" } });

  if (!ownerExists) {
    await prisma.user.create({
      data: {
        email: OWNER_EMAIL,
        passwordHash: await hash(OWNER_PASSWORD, 12),
        role: "owner",
        rating: 0,
        trustScore: 100,
      },
    });
  }

  for (const cat of CATEGORIES) {
    if (!(await prisma.category.findUnique({ where: { slug: cat.slug } }))) {
      await prisma.category.create({ data: cat });
    }
  }

  for (const p of PRODUCTS) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: p.category } });
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          categoryId: category.id,
          quantity: p.quantity,
          price: p.price,
          features: p.features,
          images: [],
        },
      });
    }
  }

  console.log("Seed complete ✓");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());