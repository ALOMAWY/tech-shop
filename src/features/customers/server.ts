"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hash } from "bcryptjs";
import { db, isUniqueError } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";

const CreateCustomerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().optional(),
});

const UpdateCustomerSchema = z.object({
  email: z.string().email("Invalid email").optional(),
  address: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
});

export async function createCustomer(formData: FormData) {
  const session = await requireAdmin();

  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    address: formData.get("address"),
  };

  const validated = CreateCustomerSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    const passwordHash = await hash(validated.data.password, 12);
    
    await db.user.create({
      data: {
        email: validated.data.email,
        passwordHash,
        role: "customer",
        address: validated.data.address || null,
        createdBy: session.user.id,
      },
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: { email: ["Email already exists"] } };
    }
    return { error: { _errors: ["Database error"] } };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  await requireAdmin();

  const rawData = {
    email: formData.get("email"),
    address: formData.get("address"),
    rating: formData.get("rating"),
  };

  const validated = UpdateCustomerSchema.safeParse(rawData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db.user.update({
      where: { id, role: "customer" },
      data: validated.data,
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (error) {
    if (isUniqueError(error)) {
      return { error: { email: ["Email already exists"] } };
    }
    return { error: { _errors: ["Database error"] } };
  }
}

export async function blockCustomer(id: string) {
  await requireAdmin();

  try {
    await db.user.update({
      where: { id, role: "customer" },
      data: { isBlocked: true },
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function unblockCustomer(id: string) {
  await requireAdmin();

  try {
    await db.user.update({
      where: { id, role: "customer" },
      data: { isBlocked: false },
    });

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function getCustomers() {
  await requireAdmin();

  return await db.user.findMany({
    where: { role: "customer" },
    select: {
      id: true,
      email: true,
      address: true,
      rating: true,
      trustScore: true,
      isBlocked: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCustomer(id: string) {
  await requireAdmin();

  return await db.user.findUnique({
    where: { id, role: "customer" },
    select: {
      id: true,
      email: true,
      address: true,
      rating: true,
      trustScore: true,
      isBlocked: true,
      createdAt: true,
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}