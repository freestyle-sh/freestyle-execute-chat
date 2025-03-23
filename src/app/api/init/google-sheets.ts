import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siGooglesheets } from "simple-icons";

export default async function initGoogleSheets() {
  const gsheets = await db
    .insert(freestyleModulesTable)
    .values({
      name: "Google Sheets",
      example: "Read and write data to Google Sheets",
      svg: siGooglesheets.svg,
      lightModeColor: siGooglesheets.hex,
      darkModeColor: siGooglesheets.hex,
      _specialBehavior: "google-sheets",
      documentation: `
      ## Setup
      import { sheets_v4, auth } from '@googleapis/sheets';

      // Set up authentication with the provided token
      const oauth2Client = new auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_SHEETS_TOKEN
      });

      // Create a sheets client
      const sheetsClient = new sheets_v4.Sheets({
        auth: oauth2Client
      });
      `,
      nodeModules: {
        "@googleapis/sheets": "4.0.2",
      },
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: gsheets[0].id,
    name: "GOOGLE_SHEETS_ACCESS_TOKEN",
    description: "Google Sheets token",
    example: "your-google-sheets-token",
  });
}