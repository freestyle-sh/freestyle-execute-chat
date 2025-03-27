import { siGooglecalendar } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { OAuthUI, OAuthUIProps } from "./oauth";

type GoogleCalendarUIProps = {
  module: ModuleWithRequirements;
} & Omit<
  Partial<OAuthUIProps>,
  "module" | "serviceName" | "providerName" | "svg" | "color" | "scopes"
>;

export function GoogleCalendarUI({
  module,
  ...props
}: GoogleCalendarUIProps): React.ReactNode {
  return (
    <OAuthUI
      module={module}
      serviceName="Calendar"
      providerName="google"
      svg={siGooglecalendar.svg}
      color={siGooglecalendar.hex}
      scopes={["https://www.googleapis.com/auth/calendar"]}
      {...props}
    />
  );
}

