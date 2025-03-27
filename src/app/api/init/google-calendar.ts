import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siGooglecalendar } from "simple-icons";

export default async function initGoogleCalendar() {
  const gcal = await db
    .insert(freestyleModulesTable)
    .values({
      name: "Google Calendar",
      example: "Get calendar events from Google Calendar",
      svg: siGooglecalendar.svg,
      lightModeColor: siGooglecalendar.hex,
      darkModeColor: siGooglecalendar.hex,
      _specialBehavior: "google-calendar",
      documentation: `
      ## Setup
      import { calendar_v3, auth } from '@googleapis/calendar';

      // Set up authentication with the provided token
      const oauth2Client = new auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_CALENDAR_ACCESS_TOKEN
      });

      // Create a calendar client
      const calendarClient = new calendar_v3.Calendar({
        auth: oauth2Client
      });
      `,
      nodeModules: {
        "@googleapis/calendar": "9.8.0",
      },
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: gcal[0].id,
    name: "GOOGLE_CALENDAR_ACCESS_TOKEN",
    description: "Google Calendar token",
    example: "your-google-calendar-token",
    source: "oauth",
    oauthProvider: "google",
    oauthScopes: ["https://www.googleapis.com/auth/calendar"],
  });
}
