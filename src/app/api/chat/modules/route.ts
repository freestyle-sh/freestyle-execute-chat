import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { chatModulesEnabledTable } from "@/db/schema";

const toggleModuleSchema = z.object({
  chatId: z.string().uuid(),
  moduleId: z.string().uuid(),
  enabled: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chatId, moduleId, enabled } = toggleModuleSchema.parse(body);

    // Check if there's an existing entry
    const existingEntry = await db
      .select()
      .from(chatModulesEnabledTable)
      .where(
        and(
          eq(chatModulesEnabledTable.chatId, chatId),
          eq(chatModulesEnabledTable.moduleId, moduleId),
        ),
      )
      .then((rows) => rows[0]);

    if (existingEntry) {
      // Update existing entry
      await db
        .update(chatModulesEnabledTable)
        .set({ enabled })
        .where(
          and(
            eq(chatModulesEnabledTable.chatId, chatId),
            eq(chatModulesEnabledTable.moduleId, moduleId),
          ),
        );
    } else {
      // Insert new entry
      await db.insert(chatModulesEnabledTable).values({
        chatId,
        moduleId,
        enabled,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling module:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Invalid request data",
          errors: error.errors,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      { message: "Failed to toggle module" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const chatId = url.searchParams.get("chatId");

    if (!chatId) {
      return NextResponse.json(
        { message: "Missing chatId parameter" },
        { status: 400 },
      );
    }

    // Get enabled modules for this chat
    const enabledModules = await db
      .select()
      .from(chatModulesEnabledTable)
      .where(eq(chatModulesEnabledTable.chatId, chatId));

    return NextResponse.json({
      chatId,
      enabledModules,
    });
  } catch (error) {
    console.error("Error fetching enabled modules:", error);
    return NextResponse.json(
      { message: "Failed to fetch enabled modules" },
      { status: 500 },
    );
  }
}

