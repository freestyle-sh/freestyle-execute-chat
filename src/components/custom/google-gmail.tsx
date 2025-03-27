import { siGmail } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { OAuthUI, OAuthUIProps } from "./oauth";

type GoogleGmailUIProps = {
  module: ModuleWithRequirements;
} & Omit<
  Partial<OAuthUIProps>,
  "module" | "serviceName" | "providerName" | "svg" | "color" | "scopes"
>;

export function GoogleGmailUI({
  module,
  ...props
}: GoogleGmailUIProps): React.ReactNode {
  return (
    <OAuthUI
      module={module}
      serviceName="Gmail"
      providerName="google"
      svg={siGmail.svg}
      color={siGmail.hex}
      scopes={[
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.compose",
      ]}
      {...props}
    />
  );
}