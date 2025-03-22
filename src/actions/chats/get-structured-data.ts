"use server";

import { db } from "@/db";
import { userFormResponsesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { stackServerApp } from "@/stack";

// This action allows the assistant to get the submitted form data
export async function getStructuredDataSubmission(
  chatId: string,
  toolCallId: string,
) {
  "use server";

  const user = await stackServerApp.getUser({ or: "anonymous" });
  const userId = user.id;

  // Only get form responses that belong to this user's chat and the specific tool call
  const response = await db
    .select()
    .from(userFormResponsesTable)
    .where(
      and(
        eq(userFormResponsesTable.chatId, chatId),
        eq(userFormResponsesTable.toolCallId, toolCallId),
      ),
    )
    .limit(1);

  if (response.length === 0) {
    return {
      status: "not_found",
      data: null,
    };
  }

  const formResponse = response[0];

  if (formResponse.state === "idle") {
    return {
      status: "pending",
      data: null,
    };
  }

  if (formResponse.state === "cancelled") {
    return {
      status: "cancelled",
      data: null,
    };
  }

  if (formResponse.state === "submitted") {
    return {
      status: "submitted",
      data: formResponse.formData,
    };
  }

  // Default fallback
  return {
    status: "unknown",
    data: null,
  };
}

export async function getOrCreateStructuredDataResponse(
  title: string,
  chatId: string,
  toolCallId: string,
) {
  const response = await db
    .select()
    .from(userFormResponsesTable)
    .where(
      and(
        eq(userFormResponsesTable.chatId, chatId),
        eq(userFormResponsesTable.toolCallId, toolCallId),
      ),
    )
    .limit(1);

  if (response.length === 0) {
    const res = await db
      .insert(userFormResponsesTable)
      .values({
        id: crypto.randomUUID(),
        chatId,
        toolCallId,
        formTitle: title,
        state: "idle", // Initial state
        // formData: null, // Will be filled when user submits
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return res[0];
  }

  return response[0];
}

export async function getStructuredDataResponse(
  chatId: string,
  toolCallId: string,
) {
  const response = await db
    .select()
    .from(userFormResponsesTable)
    .where(
      and(
        eq(userFormResponsesTable.chatId, chatId),
        eq(userFormResponsesTable.toolCallId, toolCallId),
      ),
    )
    .limit(1);

  if (response.length === 0) {
    return null;
  }

  return response[0];
}

export async function updateStructuredDataResponse(
  id: string,
  data: { state: string; formData?: Record<string, unknown> },
) {
  return db
    .update(userFormResponsesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userFormResponsesTable.id, id))
    .returning();
}
