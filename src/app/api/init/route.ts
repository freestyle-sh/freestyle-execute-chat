import { db } from "@/db";
import { freestyleModulesTable } from "@/db/schema";
import initResend from "./resend";
import initPostgres from "./postgres";

export async function POST() {
  await db.delete(freestyleModulesTable);

  await initResend();
  await initPostgres();
}
