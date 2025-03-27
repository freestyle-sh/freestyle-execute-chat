import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siGmail } from "simple-icons";

export default async function initGoogleGmail() {
  const gmail = await db
    .insert(freestyleModulesTable)
    .values({
      name: "Gmail",
      example: "Read emails and send emails via Gmail",
      svg: siGmail.svg,
      lightModeColor: siGmail.hex,
      darkModeColor: siGmail.hex,
      _specialBehavior: "google-gmail",
      documentation: `
      ## Setup
      import { gmail_v1, auth } from '@googleapis/gmail';

      // Set up authentication with the provided token
      const oauth2Client = new auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_GMAIL_ACCESS_TOKEN
      });

      // Create a gmail client
      const gmailClient = new gmail_v1.Gmail({
        auth: oauth2Client
      });
      `,
      nodeModules: {
        "@googleapis/gmail": "5.0.0",
      },
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: gmail[0].id,
    name: "GOOGLE_GMAIL_ACCESS_TOKEN",
    description: "Google Gmail token",
    example: "your-google-gmail-token",
    source: "oauth",
    oauthProvider: "google",
    oauthScopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.compose",
    ],
  });
}
