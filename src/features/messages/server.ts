"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/guards";

const SendMessageSchema = z.object({
  receiverId: z.string(),
  content: z.string().trim().min(1).max(4000),
});

export async function sendMessage(receiverId: string, content: string) {
  const session = await requireUser();
  const validated = SendMessageSchema.safeParse({ receiverId, content });
  if (!validated.success) return { error: "Invalid message" };

  try {
    await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId: validated.data.receiverId,
        content: validated.data.content,
      },
    });

    revalidatePath("/dashboard/messages");
    revalidatePath("/messages");
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function markConversationSeen(otherId: string) {
  const session = await requireUser();

  try {
    await db.message.updateMany({
      where: { senderId: otherId, receiverId: session.user.id, seenAt: null },
      data: { seenAt: new Date() },
    });
    return { success: true };
  } catch {
    return { error: "Database error" };
  }
}

export async function getConversationList() {
  const session = await requireUser();

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: session.user.id }, { receiverId: session.user.id }],
    },
    orderBy: { sentAt: "asc" },
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      content: true,
      sentAt: true,
      seenAt: true,
    },
  });

  const otherIds = [
    ...new Set(
      messages.map((m) =>
        m.senderId === session.user.id ? m.receiverId : m.senderId,
      ),
    ),
  ];

  const users = await db.user.findMany({
    where: { id: { in: otherIds } },
    select: { id: true, email: true, role: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const byOther = new Map<string, typeof messages>();
  for (const m of messages) {
    const other = m.senderId === session.user.id ? m.receiverId : m.senderId;
    const list = byOther.get(other) ?? [];
    list.push(m);
    byOther.set(other, list);
  }

  const conversations = [...byOther.entries()].map(([otherId, list]) => {
    const last = list[list.length - 1];
    const unread = list.filter(
      (m) => m.receiverId === session.user.id && !m.seenAt,
    ).length;
    const user = userMap.get(otherId);
    return {
      otherId,
      otherEmail: user?.email ?? "unknown",
      otherRole: user?.role ?? "customer",
      lastContent: last.content,
      lastAt: last.sentAt.toISOString(),
      unread,
    };
  });

  conversations.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  return conversations;
}

export async function getConversation(otherId: string) {
  const session = await requireUser();

  const [messages, other] = await Promise.all([
    db.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherId },
          { senderId: otherId, receiverId: session.user.id },
        ],
      },
      orderBy: { sentAt: "asc" },
      select: {
        id: true,
        senderId: true,
        content: true,
        sentAt: true,
        seenAt: true,
      },
    }),
    db.user.findUnique({ where: { id: otherId }, select: { email: true } }),
  ]);

  return {
    messages: messages.map((m) => ({
      ...m,
      sentAt: m.sentAt.toISOString(),
      seenAt: m.seenAt?.toISOString() ?? null,
    })),
    otherEmail: other?.email ?? "unknown",
  };
}
