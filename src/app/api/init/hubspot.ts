import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siHubspot } from "simple-icons";

export default async function initHubspot() {
  const hubspot = await db
    .insert(freestyleModulesTable)
    .values({
      name: "HubSpot",
      svg: siHubspot.svg,
      lightModeColor: siHubspot.hex,
      darkModeColor: siHubspot.hex,
      nodeModules: {
        "@hubspot/api-client": "12.0.1",
      },
      documentation: `
      ## Setup
      import { Client } from '@hubspot/api-client';

      // Initialize the HubSpot client
      const hubspotClient = new Client({
        accessToken: process.env.HUBSPOT_API_KEY
      });
      `,
      setupInstructions: `
      ## Connecting to your HubSpot Account

      1. Go to your HubSpot account and navigate to Settings > Account Setup > Integrations > API Key.
      
      2. Create a new Private App with the necessary scopes for your integration.
      
      3. Copy the Access Token.
      
      4. Add the Access Token to your environment variables with the name "HUBSPOT_API_KEY".
      `,
      example: `Interact with your HubSpot CRM, marketing tools, and more`,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: hubspot[0].id,
      name: "HUBSPOT_API_KEY",
      description: "HubSpot API Key (Private App Access Token)",
      example: "pat-na1-11111111-2222-3333-4444-555555555555",
    },
  ]);
  return hubspot;
}