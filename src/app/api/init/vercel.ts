import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siVercel } from "simple-icons";
import { vercelDocs } from "./vercel/vercel-processed-docs";
export default async function initVercel() {
  const vercel = await db
    .insert(freestyleModulesTable)
    .values({
      name: "vercel",
      svg: siVercel.svg,
      lightModeColor: siVercel.hex,
      darkModeColor: "000000",
      documentation: vercelDocs,
      nodeModules: {
        "@vercel/sdk": "1.5.0",
      },
      example: `Interact with the Vercel API`,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: vercel[0].id,
    name: "VERCEL_TOKEN",
    description: "Vercel API token",
    example: "your-vercel-api-token",
  });

  return vercel;
}
