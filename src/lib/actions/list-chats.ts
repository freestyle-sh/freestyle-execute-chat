"use server";
import { db } from "@/db";
import { chatsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { STACKAUTHID } from "./tempuserid";

export async function listChats() {
  "use server";

  return await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, STACKAUTHID));
}
