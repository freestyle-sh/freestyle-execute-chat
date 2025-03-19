import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siSlack } from "simple-icons";

export default async function initSlack() {
  const slack = await db
    .insert(freestyleModulesTable)
    .values({
      name: "slack",
      svg: siSlack.svg,
      lightModeColor: siSlack.hex,
      darkModeColor: siSlack.hex,
      nodeModules: {
        "@slack/web-api": "7.8.0",
      },
      example: `Interact with your Slack account`,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: slack[0].id,
      name: "SLACK_BOT_TOKEN",
      description: "Slack bot token",
      example:
        "xoxb-123456789012-1234567890123-123456789012345678901234567890123456",
    },
  ]);
  return slack;
}
