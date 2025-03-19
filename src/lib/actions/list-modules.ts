"use server";
import { db } from "@/db";
import { type FreestyleModule, freestyleModulesTable } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function listModules(): Promise<FreestyleModule[]> {
  "use server";

  const modules = await db
    .select()
    .from(freestyleModulesTable)
    .orderBy(desc(freestyleModulesTable.priority));

  return modules;
}
