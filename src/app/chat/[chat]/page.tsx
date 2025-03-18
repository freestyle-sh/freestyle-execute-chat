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
    new?: string;
  }>;
}) {
  const { chat: chatId } = await params;
  const { new: newChat } = await searchParams;

  const initialChatState = await getChat(chatId);
  const isNew = newChat !== undefined;

  return (
    <>
      <ChatUI initialMessages={initialChatState} isNew={isNew} />
    </>
  );
}
