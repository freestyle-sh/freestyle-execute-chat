"use server";
import { db } from "@/db";
import { chatsTable, messagesTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import type { Message, ToolInvocation } from "ai";
import { stackServerApp } from "@/stack";

export async function insertMessage(chatId: string, message: Message) {
  "use server";

  const user = await stackServerApp.getUser({ or: "anonymous" });
  const userId = user.id;

  const chat = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.id, chatId));

  if (chat[0].userId !== userId) {
    throw new Error("Chat does not belong to user");
  }

  // Check if this is a tool-related result
  const toolResultParts = message.parts?.filter(
    (part) =>
      part.type === "tool-invocation" &&
      part.toolInvocation?.state === "result",
  ) as
    | { type: "tool-invocation"; toolInvocation: ToolInvocation }[]
    | undefined;
  const toolCallIds =
    toolResultParts?.map((part) => part.toolInvocation.toolCallId) ?? [];

  // Get existing assistant messages in this chat
  const assistantMessages = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.chatId, chatId),
        eq(messagesTable.role, "assistant"),
      ),
    )
    .orderBy(desc(messagesTable.createdAt));

  // Find the message with a matching tool call ID
  for (const existingMessage of assistantMessages) {
    if (existingMessage.parts === undefined) {
      continue;
    }

    const parts = existingMessage.parts;

    const matchingParts = parts.filter(
      (part) =>
        part.type === "tool-invocation" &&
        toolCallIds.includes(part.toolInvocation.toolCallId) &&
        (part.toolInvocation.state === "call" ||
          part.toolInvocation.state === "partial-call"),
    );

    if (matchingParts.length > 0) {
      return await db
        .update(messagesTable)
        .set({
          parts: message.parts,
          content: message.content,
        })
        .where(eq(messagesTable.id, existingMessage.id))
        .returning()
        .then((result) => result[0]);
    }
  }

  return await db
    .insert(messagesTable)
    .values({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      role: message.role,
      content: message.content,
      parts: message.parts,
      chatId: chatId,
    })
    .returning()
    .then((result) => result[0]);
}
