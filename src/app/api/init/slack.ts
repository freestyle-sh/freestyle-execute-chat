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
      setupInstructions: `
      ## Connecting to your Slack Workspace

      1. Create an app at https://api.slack.com/apps and create an app.

      2. Install the app to your workspace.

      3. Go to the "OAuth & Permissions" page and add all the scopes you need, most commonly "chat:write", "chat:read", "channels:history", "channels:read", and "channels:join", "groups:read" and "groups:write".

      3. On the "OAuth & Permissions" page and copy the "Bot User OAuth Access Token".

      4. Add the "Bot User OAuth Access Token" to your environment variables with the name "SLACK_BOT_TOKEN".
      `,
      example: `Interact with your Slack Workspace`,
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
