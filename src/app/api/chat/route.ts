import { db } from "@/db";
import { messagesTable } from "@/db/schema";
import { claudeSonnetModel } from "@/lib/model";
import { CoreMessage, streamText } from "ai";
import { executeTool } from "freestyle-sandboxes/ai";
export async function POST(request: Request) {
  const json: {
    messages: CoreMessage[];
  } = await request.json();

  const chatId = request.headers.get("chat-id");

  if (!chatId) {
    throw new Error("chat-id header is required");
  }

  const lastMessage = json.messages[json.messages.length - 1];

  if (json.messages.length >= 2 && lastMessage.role === "user") {
    await db.insert(messagesTable).values({
      ...lastMessage,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      content: lastMessage.content.toString(),
      role: lastMessage.role,
      chatId,
    });
  }

  console.log("JSON", json, "CHAT ID", chatId);

  return streamText({
    model: claudeSonnetModel,
    maxSteps: 10,
    system: "You are a rude assistant. Be rude. Be sassy. Make it personal.",
    tools: {
      codeExecutor: executeTool({
        apiKey: process.env.FREESTYLE_API_KEY!,
      }),
    },
    messages: json.messages,
  }).toDataStreamResponse();
}
