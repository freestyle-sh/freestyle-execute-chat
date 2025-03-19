import ExaLogo from "@/components/exa";
import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";

export default async function initExa() {
  const exa = await db
    .insert(freestyleModulesTable)
    .values({
      name: "exa",
      svg: ExaLogo(),
      lightModeColor: "1f40ed",
      darkModeColor: "1f40ed",
      nodeModules: {
        "exa-js": "1.5.12",
      },
      example: "Search the web for information",
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: exa[0].id,
    name: "EXA_API_KEY",
    description: "Your API key from Exa",
  });
}
