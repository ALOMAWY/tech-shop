"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";
import { useState } from "react";
import { sendMessage } from "@/features/messages/server";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";

type Conversation = {
  otherId: string;
  otherEmail: string;
  otherRole: string;
  lastContent: string;
  lastAt: string;
  unread: number;
};

export function ConversationList({
  conversations,
  basePath = "/dashboard/messages",
}: {
  conversations: Conversation[];
  basePath?: string;
}) {
  const t = useTranslations("Messages");
  const pathname = usePathname();

  return (
    <Card pad className="space-y-1">
      <p className="mb-2 text-sm font-medium text-text-2">{t("title")}</p>
      {conversations.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-2">{t("empty")}</p>
      ) : (
        conversations.map((c) => {
          const active = pathname?.endsWith(c.otherId);
          return (
            <Link
              key={c.otherId}
              href={`${basePath}/${c.otherId}`}
              className={`block rounded-[6px] px-3 py-2 transition-colors ${
                active ? "bg-chip" : "hover:bg-chip"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-medium">{c.otherEmail}</span>
                {c.unread > 0 && (
                  <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-copper px-1 font-mono text-[11px] text-on-accent">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-xs text-text-2">{c.lastContent}</p>
            </Link>
          );
        })
      )}
    </Card>
  );
}

export function ConversationThread({
  otherId,
  otherEmail,
  messages,
  currentUserId,
}: {
  otherId: string;
  otherEmail: string;
  currentUserId: string;
  messages: {
    id: string;
    senderId: string;
    content: string;
    sentAt: string;
    seenAt: string | null;
  }[];
}) {
  const t = useTranslations("Messages");
  const router = useRouter();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <Card pad className="flex min-h-[480px] flex-col">
      <div className="flex items-center justify-between border-b border-line-soft pb-3">
        <p className="truncate text-sm font-medium">{otherEmail}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-2">{t("noMessages")}</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-[6px] px-3.5 py-2 text-sm ${
                    mine
                      ? "bg-mint text-on-accent"
                      : "border border-line-soft bg-bg"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p
                    className={`mt-1 text-[11px] ${
                      mine ? "text-on-accent/70" : "text-text-2"
                    }`}
                  >
                    {formatDateTime(m.sentAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        className="flex gap-2 border-t border-line-soft pt-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!text.trim() || sending) return;
          setSending(true);
          const result = await sendMessage(otherId, text.trim());
          if (result.success) {
            setText("");
            router.refresh();
          }
          setSending(false);
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
        />
        <Button type="submit" disabled={sending || !text.trim()}>
          {sending ? t("sending") : t("send")}
        </Button>
      </form>
    </Card>
  );
}