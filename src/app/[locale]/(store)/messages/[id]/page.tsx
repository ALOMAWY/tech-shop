import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/guards";
import { TraceDivider } from "@/components/ui/TraceDivider";
import { ConversationThread } from "@/components/owner/Messages";
import { getConversation, markConversationSeen } from "@/features/messages/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";

export default async function CustomerConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await requireUser();
  setRequestLocale(locale);
  const t = await getTranslations("Messages");

  const { messages, otherEmail } = await getConversation(id);
  await markConversationSeen(id);

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display flex items-center gap-2.5 text-[22px] font-medium">
            <span aria-hidden className="inline-block h-[18px] w-[8px] rounded-[3px] bg-mint" />
            {t("title")}
          </h1>
          <TraceDivider className="mt-3" />
        </div>
        <Link href="/messages" className={buttonClasses("ghost", "text-sm")}>
          {t("backToList")}
        </Link>
      </div>
      <ConversationThread
        otherId={id}
        otherEmail={otherEmail}
        currentUserId={session.user.id}
        messages={messages}
      />
    </div>
  );
}