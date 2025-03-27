import { siGooglecalendar } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { GoogleOAuthUI, GoogleOAuthUIProps } from "./google-oauth";

type GoogleCalendarUIProps = {
  module: ModuleWithRequirements;
} & Omit<Partial<GoogleOAuthUIProps>, 'module' | 'serviceName' | 'svg' | 'color' | 'scopes'>;

export function GoogleCalendarUI({
  module,
  ...props
}: GoogleCalendarUIProps): React.ReactNode {
  return (
    <GoogleOAuthUI
      module={module}
      serviceName="Calendar"
      svg={siGooglecalendar.svg}
      color={siGooglecalendar.hex}
      scopes={["https://www.googleapis.com/auth/calendar"]}
      {...props}
    />
  );
}