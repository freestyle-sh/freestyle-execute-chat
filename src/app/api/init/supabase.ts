import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siSupabase } from "simple-icons";
export default async function initSupabase() {
  const supabaseMod = await db
    .insert(freestyleModulesTable)
    .values({
      name: "supabase",
      svg: siSupabase.svg,
      color: siSupabase.hex,
      nodeModules: {
        "@supabase/supabase-js": "2.49.1",
      },
      example: "Interact with your Supabase project",
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: supabaseMod[0].id,
      name: "SUPABASE_URL",
      description: "Supabase URL",
      example: "https://<project-id>.supabase.co",
    },
    {
      moduleId: supabaseMod[0].id,
      name: "SUPABASE_KEY",
      description: "Supabase key",
      example:
        "eyAhbGciOiJFUzI1ziIsInR5cCI9IkpXVCJ9.eyJhdXRoIj5iZ3Vlc3QiLCJkYXRhIjani1AmaNxlX3ZYbHV4IiwidGBTZXN0YW1wIjoxNzQyMzg1MDAwfQ.WN8X3YvLqZ5Qv1KmJf9pT0-Jz9Fd4yRhOdeEzNutZ8z3E",
    },
  ]);

  return supabaseMod;
}
