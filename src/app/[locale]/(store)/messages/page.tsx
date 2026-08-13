import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { ConversationList } from "@/components/owner/Messages";
import { getConversationList } from "@/features/messages/server";

export default async function CustomerMessagesPage({
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
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <div>
        <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
          <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
          {t("title")}
        </h1>
        <TraceDivider className="mt-3" />
      </div>
      <ConversationList conversations={conversations} basePath="/messages" />
    </div>
  );
}