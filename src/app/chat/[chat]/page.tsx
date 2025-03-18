import { ChatUI } from "@/components/chat";
import { getChat } from "@/lib/actions/get-chat";

export default async function ChatPage({
  params,
  searchParams,
}: {
  params: {
    chat: string;
  };
  searchParams: {
    new?: string;
  };
}) {
  const initialChatState = await getChat(params.chat);
  const isNew = searchParams.new !== undefined;

  return (
    <>
      <ChatUI initialMessages={initialChatState} isNew={isNew} />
    </>
  );
}
