import { ChatUI } from "@/components/chat";
import { getChat } from "@/lib/actions/get-chat";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{
    chat: string;
  }>;
  searchParams: {
    new?: string;
  };
}) {
  const { chat: chatId } = await params;
  const initialChatState = await getChat(chatId);
  const isNew = (await searchParams).new !== undefined;

  return (
    <>
      <ChatUI initialMessages={initialChatState} isNew={isNew} />
    </>
  );
}
