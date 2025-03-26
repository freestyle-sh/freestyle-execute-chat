import { siGooglesheets } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { GoogleOAuthUI } from "./google-oauth";

export function GoogleSheetsUI(props: {
  module: ModuleWithRequirements;
}): React.ReactNode {
  return (
    <GoogleOAuthUI
      module={props.module}
      serviceName="Sheets"
      svg={siGooglesheets.svg}
      color={siGooglesheets.hex}
      scopes={["https://www.googleapis.com/auth/spreadsheets"]}
    />
  );
}