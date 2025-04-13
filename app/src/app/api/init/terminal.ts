import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import terminalSvg from "./terminal/terminal-svg";
import terminalDocs from "./terminal/terminal-docs";

export default async function initTerminalShop() {
  const terminalShop = await db
    .insert(freestyleModulesTable)
    .values({
      name: "Terminal Shop",
      example: "Interact with the Terminal Shop API",
      setupInstructions: `
Run \`ssh terminal.shop -t tokens\` in your terminal to get your Terminal Shop Bearer Token, put it into the environment variable \`TERMINAL_BEARER_TOKEN\`
`,
      svg: terminalSvg,
      lightModeColor: "000000",
      darkModeColor: "ffffff",
      nodeModules: {
        "@terminaldotshop/sdk": "1.6.0",
      },
      documentation: terminalDocs,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: terminalShop[0].id,
      name: "TERMINAL_BEARER_TOKEN",
      description: "Terminal Shop Bearer Token",
      example: "trm_live_ge4cZ23aniaffb3nD0v3r",
    },
  ]);
}
