"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { stackServerApp } from "@/stack";
import { eq } from "drizzle-orm";

export async function deleteAccount() {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  await db.delete(usersTable).where(eq(usersTable.id, user.id));

  await user.delete();
}
