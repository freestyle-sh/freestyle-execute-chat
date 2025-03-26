import { siGmail } from "simple-icons";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { GoogleOAuthUI } from "./google-oauth";

export function GoogleGmailUI(props: {
  module: ModuleWithRequirements;
}): React.ReactNode {
  return (
    <GoogleOAuthUI
      module={props.module}
      serviceName="Gmail"
      svg={siGmail.svg}
      color={siGmail.hex}
      scopes={[
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.compose"
      ]}
    />
  );
}