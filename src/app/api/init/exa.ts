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
      setupInstructions: `
      1. Visit [https://exa.ai](https://exa.ai) and sign up for an account if you don't already have one
      2. After signing in, navigate to your dashboard
      3. Go to the [API Keys section](https://dashboard.exa.ai/api-keys) page in your dashboard
      4. Generate a new API Key
      5. Copy the API key and put it into the environment variable \`EXA_API_KEY\`

      For more information, refer to the official documentation at [https://docs.exa.ai](https://docs.exa.ai)
      `,
      example: "Search the web for information",
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: exa[0].id,
    name: "EXA_API_KEY",
    description: "Your API key from Exa",
  });
}
