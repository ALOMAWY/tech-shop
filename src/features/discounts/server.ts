"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, isUniqueError } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import type { DiscountType } from "@prisma/client";

const CreateDiscountSchema = z.object({
  code: z.string().trim().min(3).max(20).regex(/^[A-Z0-9_-]+$/, "Uppercase letters, numbers, _ or - only"),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.coerce.number().positive(),
  applicableProducts: z.array(z.string()).default([]),
  applicableCustomers: z.array(z.string()).default([]),
  expiry: z.string().optional().transform((s) => (s ? new Date(s) : null)),
  active: z.coerce.boolean().default(true),
});

export async function createDiscount(input: {
  code: string;
  type: DiscountType;
  value: number;
  applicableProducts?: string[];
  applicableCustomers?: string[];
  expiry?: string | null;
  active?: boolean;
}) {
  await requireAdmin();

  const validated = CreateDiscountSchema.safeParse({
    ...input,
    code: input.code.toUpperCase(),
  });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  if (validated.data.type === "PERCENT" && validated.data.value > 100) {
    return { error: { value: ["Percent must be ≤ 100"] } };
  }

  try {
    await db.discountCode.create({
      data: {
        code: validated.data.code,
        type: validated.data.type,
        value: validated.data.value,
        applicableProducts: validated.data.applicableProducts,
        applicableCustomers: validated.data.applicableCustomers,
        expiry: validated.data.expiry,
        active: validated.data.active,
      },
    });

    revalidatePath("/dashboard/discounts");
    return { success: true };
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: { code: ["This code already exists"] } };
    }
    return { error: { _errors: ["Database error"] } };
  }
}

export async function toggleDiscount(id: string, active: boolean) {
  await requireAdmin();

  try {
    await db.discountCode.update({ where: { id }, data: { active } });
    revalidatePath("/dashboard/discounts");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function deleteDiscount(id: string) {
  await requireAdmin();

  try {
    await db.discountCode.delete({ where: { id } });
    revalidatePath("/dashboard/discounts");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function getDiscounts() {
  await requireAdmin();

  const codes = await db.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  const productIds = [...new Set(codes.flatMap((c) => c.applicableProducts))];
  const customerIds = [...new Set(codes.flatMap((c) => c.applicableCustomers))];

  const [products, customers] = await Promise.all([
    db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } }),
    db.user.findMany({
      where: { id: { in: customerIds }, role: "customer" },
      select: { id: true, email: true },
    }),
  ]);

  const productNames = new Map(products.map((p) => [p.id, p.name]));
  const customerEmails = new Map(customers.map((u) => [u.id, u.email]));

  return codes.map((c) => ({
    ...c,
    value: c.value.toString(),
    expiry: c.expiry?.toISOString() ?? null,
    createdAt: c.createdAt.toISOString(),
    productNames: c.applicableProducts.map((id) => productNames.get(id)).filter(Boolean) as string[],
    customerEmails: c.applicableCustomers.map((id) => customerEmails.get(id)).filter(Boolean) as string[],
  }));
}

export async function getDiscountFormData() {
  await requireAdmin();

  const [products, customers] = await Promise.all([
    db.product.findMany({ select: { id: true, name: true, price: true }, orderBy: { name: "asc" } }),
    db.user.findMany({
      where: { role: "customer" },
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);

  return {
    products: products.map((p) => ({ ...p, price: p.price.toString() })),
    customers,
  };
}