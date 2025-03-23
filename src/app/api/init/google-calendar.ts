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
      nodeModules: {
        "@googleapis/calendar": "9.8.0",
      },
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: gcal[0].id,
    name: "GOOGLE_CALENDAR_TOKEN",
    description: "Google Calendar token",
    example: "your-google-calendar-token",
  });
}
