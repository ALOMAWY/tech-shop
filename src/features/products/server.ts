"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

const ProductSchema = z.object({
  name: z.string().min(1, "Name required"),
  categoryId: z.string().min(1, "Category required"),
  sku: z.string().min(1, "SKU required"),
  price: z.coerce.number().positive("Price must be positive"),
  quantity: z.coerce.number().int().nonnegative("Quantity must be non-negative"),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    sku: formData.get("sku"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    features: formData.getAll("features").filter((f) => f !== ""),
    images: formData.getAll("images").filter((i) => i !== ""),
  };

  const validated = ProductSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db.product.create({
      data: {
        ...validated.data,
        features: validated.data.features,
        images: validated.data.images,
      },
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: { _errors: ["Database error"] } };
  }
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    sku: formData.get("sku"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    features: formData.getAll("features").filter((f) => f !== ""),
    images: formData.getAll("images").filter((i) => i !== ""),
  };

  const validated = ProductSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db.product.update({
      where: { id },
      data: {
        ...validated.data,
        features: validated.data.features,
        images: validated.data.images,
      },
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: { _errors: ["Database error"] } };
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  try {
    await db.product.delete({ where: { id } });
    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: "Database error" };
  }
}

export async function getProducts() {
  return await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProduct(id: string) {
  return await db.product.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function getCategories() {
  return await db.category.findMany({
    orderBy: { order: "asc" },
  });
}