import { db } from "@/db";
import { freestyleModulesTable } from "@/db/schema";
import initResend from "./resend";
import initPostgres from "./postgres";
import initSupabase from "./supabase";
import initVercel from "./vercel";
import initStripe from "./stripe";

export async function POST() {
  await db.delete(freestyleModulesTable);

  await initResend();
  await initPostgres();
  await initSupabase();
  await initVercel();
  await initStripe();

  return new Response("Initialized", { status: 200 });
}
