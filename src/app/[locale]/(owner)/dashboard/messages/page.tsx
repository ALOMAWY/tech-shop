import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { ConversationList } from "@/components/owner/Messages";
import { getConversationList } from "@/features/messages/server";

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireUser();
  setRequestLocale(locale);
  const t = await getTranslations("Messages");

  const conversations = await getConversationList();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
          <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-text-2">{t("subtitle")}</p>
        <TraceDivider className="mt-3" />
      </div>
      <div className="max-w-xl">
        <ConversationList conversations={conversations} />
      </div>
    </div>
  );
}