import { ChatUI } from "@/components/chat";
import { getChat } from "@/lib/actions/get-chat";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{
    chat: string;
  }>;
  searchParams: Promise<{
    respond?: string;
  }>;
}) {
  const { chat: chatId } = await params;
  const { respond: shouldRespond } = await searchParams;

  const initialChatState = await getChat(chatId);
  const isNew = shouldRespond !== undefined;

  return (
    <div className="h-full w-full">
      <ChatUI
        initialMessages={initialChatState}
        respond={isNew}
        chatId={chatId}
      />
    </div>
  );
}
