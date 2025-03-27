import { siGooglesheets } from "simple-icons";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { OAuthUI, type OAuthUIProps } from "./oauth";

type GoogleSheetsUIProps = {
  module: ModuleWithRequirements;
} & Omit<
  Partial<OAuthUIProps>,
  "module" | "serviceName" | "providerName" | "svg" | "color" | "scopes"
>;

export function GoogleSheetsUI({
  module,
  ...props
}: GoogleSheetsUIProps): React.ReactNode {
  return (
    <OAuthUI
      module={module}
      serviceName="Sheets"
      providerName="google"
      svg={siGooglesheets.svg}
      color={siGooglesheets.hex}
      scopes={["https://www.googleapis.com/auth/spreadsheets"]}
      {...props}
    />
  );
}