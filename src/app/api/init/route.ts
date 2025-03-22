import { db } from "@/db";
import { freestyleModulesTable } from "@/db/schema";
import initResend from "./resend";
import initPostgres from "./postgres";
import initSupabase from "./supabase";
import initVercel from "./vercel";
import initStripe from "./stripe";
import initSlack from "./slack";
import initGithub from "./github";
import initExa from "./exa";
import initAWS from "./aws";

export async function POST() {
  await db.delete(freestyleModulesTable);

  await initResend();
  await initPostgres();
  await initSupabase();
  await initVercel();
  await initStripe();
  await initSlack();
  await initGithub();
  await initExa();
  await initAWS();

  return new Response("Initialized", { status: 200 });
}
