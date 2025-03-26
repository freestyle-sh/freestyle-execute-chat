import { siGmail } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { GoogleOAuthUI, GoogleOAuthUIProps } from "./google-oauth";

type GoogleGmailUIProps = {
  module: ModuleWithRequirements;
} & Omit<
  Partial<GoogleOAuthUIProps>,
  "module" | "serviceName" | "svg" | "color" | "scopes"
>;

export function GoogleGmailUI({
  module,
  ...props
}: GoogleGmailUIProps): React.ReactNode {
  return (
    <GoogleOAuthUI
      module={module}
      serviceName="Gmail"
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

