"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { stackServerApp } from "@/stack";
import type { CurrentServerUser } from "@stackframe/stack";

/**
 * Get the current user, ensuring they are in the database.
 */
export async function auth({
  or,
}: {
  or?:
    | "anonymous"
    | "return-null"
    | "redirect"
    | "throw"
    | "anonymous-if-exists";
} = {}): Promise<CurrentServerUser | null> {
  const user = await stackServerApp.getUser({
    or: or,
  });

  if (user !== null) {
    await db
      .insert(usersTable)
      .values({
        stackId: user.id,
        id: user.id,
      })
      .onConflictDoNothing();
  }

  return user;
}
