import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

async function getSessionUnblocked() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, isBlocked: true },
  });
  if (!user || user.isBlocked) return null;

  return { ...session, user: { ...session.user, email: user.email, role: user.role } };
}

export async function requireUser() {
  const session = await getSessionUnblocked();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireRole(role: Role) {
  const session = await getSessionUnblocked();
  if (!session?.user) redirect("/login");
  if (session.user.role !== role) redirect("/");
  return session;
}

export const requireAdmin = () => requireRole("owner");