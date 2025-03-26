import { siGooglesheets } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { GoogleOAuthUI, GoogleOAuthUIProps } from "./google-oauth";

type GoogleSheetsUIProps = {
  module: ModuleWithRequirements;
} & Omit<Partial<GoogleOAuthUIProps>, 'module' | 'serviceName' | 'svg' | 'color' | 'scopes'>;

export function GoogleSheetsUI({
  module,
  ...props
}: GoogleSheetsUIProps): React.ReactNode {
  return (
    <GoogleOAuthUI
      module={module}
      serviceName="Sheets"
      svg={siGooglesheets.svg}
      color={siGooglesheets.hex}
      scopes={["https://www.googleapis.com/auth/spreadsheets"]}
      {...props}
    />
  );
}