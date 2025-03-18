import { ChatUI } from "@/components/chat";
import { getChat } from "@/lib/actions/get-chat";

export default async function ChatPage({ params }) {
  const initialChatState = await getChat(params.chat);
  return (
    <>
      <ChatUI initialMessages={initialChatState} />
    </>
  );
}
