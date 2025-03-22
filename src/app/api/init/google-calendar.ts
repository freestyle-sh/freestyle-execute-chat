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
      nodeModules: {
        "@googleapis/calendar": "9.8.0",
      },
      setupInstructions: `
      1. Create a [Google Cloud Platform project](https://console.cloud.google.com/projectcreate)

      2. Once you have created a project, enable the Google Calendar API for your project [here](https://console.cloud.google.com/marketplace/product/google/calendar-json.googleapis.com)

      3. Create a service account [here](https://console.cloud.google.com/apis/credentials/serviceaccountkey)

      4. Give the service account the necessary permissions to access the Google Calendar API
    `,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: gcal[0].id,
    name: "GOOGLE_CALENDAR_TOKEN",
    description: "Google Calendar token",
    example: "your-google-calendar-token",
  });
}
