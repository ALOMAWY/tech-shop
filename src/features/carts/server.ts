"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/guards";

const CreateCartSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      }),
    )
    .min(1, "At least one item"),
});

export async function createReadyCart(customerId: string, items: { productId: string; quantity: number }[]) {
  const session = await requireAdmin();

  const validated = CreateCartSchema.safeParse({ customerId, items });
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    const productIds = validated.data.items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true },
    });
    const priceMap = new Map(products.map((p) => [p.id, p.price]));

    const cart = await db.cart.create({
      data: {
        customerId: validated.data.customerId,
        createdBy: session.user.id,
        items: {
          create: validated.data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: priceMap.get(item.productId) ?? 0,
          })),
        },
      },
    });

    revalidatePath("/dashboard/carts");
    return { success: true, id: cart.id };
  } catch {
    return { error: { _errors: ["Database error"] } };
  }
}

export async function sendReadyCart(id: string) {
  await requireAdmin();

  try {
    await db.cart.update({
      where: { id },
      data: { isReady: true, sentAt: new Date() },
    });
    revalidatePath("/dashboard/carts");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function deleteCart(id: string) {
  await requireAdmin();

  try {
    await db.cartItem.deleteMany({ where: { cartId: id } });
    await db.cart.delete({ where: { id } });
    revalidatePath("/dashboard/carts");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function getCarts() {
  await requireAdmin();

  const carts = await db.cart.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { email: true } },
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return carts.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    sentAt: c.sentAt?.toISOString() ?? null,
    customerEmail: c.customer.email,
    items: c.items.map((i) => ({
      id: i.id,
      productName: i.product?.name ?? "deleted",
      quantity: i.quantity,
      price: i.price.toString(),
    })),
    total: c.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
  }));
}

export async function getCartFormData() {
  await requireAdmin();

  const [products, customers] = await Promise.all([
    db.product.findMany({ select: { id: true, name: true, price: true, quantity: true }, orderBy: { name: "asc" } }),
    db.user.findMany({
      where: { role: "customer", isBlocked: false },
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
  ]);

  return {
    products: products.map((p) => ({ ...p, price: p.price.toString() })),
    customers,
  };
}

export async function getMyReadyCarts() {
  const session = await requireUser();

  const carts = await db.cart.findMany({
    where: { customerId: session.user.id, isReady: true },
    orderBy: { sentAt: "desc" },
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return carts.map((c) => ({
    id: c.id,
    sentAt: c.sentAt?.toISOString() ?? null,
    adjusted: c.adjusted,
    items: c.items.map((i) => ({
      id: i.id,
      productName: i.product?.name ?? "deleted",
      quantity: i.quantity,
      price: i.price.toString(),
    })),
    total: c.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
  }));
}

export async function adjustCartItemQuantity(cartId: string, itemId: string, quantity: number) {
  const session = await requireUser();

  const cart = await db.cart.findFirst({
    where: { id: cartId, customerId: session.user.id, isReady: true },
  });
  if (!cart) return { error: "Cart not found" };

  if (quantity < 1) return { error: "Quantity must be ≥ 1" };

  try {
    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    await db.cart.update({ where: { id: cartId }, data: { adjusted: true } });
    revalidatePath("/carts");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}