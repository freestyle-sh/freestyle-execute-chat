import { siGooglecalendar } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { GoogleOAuthUI } from "./google-oauth";

export function GoogleCalendarUI(props: {
  module: ModuleWithRequirements;
}): React.ReactNode {
  return (
    <GoogleOAuthUI
      module={props.module}
      serviceName="Calendar"
      svg={siGooglecalendar.svg}
      color={siGooglecalendar.hex}
      scopes={["https://www.googleapis.com/auth/calendar"]}
    />
  );
}