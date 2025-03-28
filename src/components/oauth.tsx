import { ModuleIcon } from "./module-icon";
import { Button } from "./ui/button";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { useEffect } from "react";
import { CopyIcon } from "lucide-react";
import { capitalize } from "@/lib/typography";

export interface OAuthUIProps {
  module: ModuleWithRequirements;
  serviceName: string;
  providerName: string;
  svg: string;
  color: string;
  scopes: string[];
  onCancel?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  isInDialog?: boolean; // Whether the component is rendered in a dialog or drawer
}

export function OAuthUI({
  module,
  serviceName,
  providerName,
  svg,
  color,
  scopes,
  // onCancel, - not currently used
  onDelete,
  onComplete,
  isInDialog = false,
}: OAuthUIProps): React.ReactNode {
  // Type for valid OAuth providers
  type ValidProvider =
    | "x"
    | "github"
    | "google"
    | "microsoft"
    | "spotify"
    | "facebook"
    | "discord"
    | "gitlab"
    | "bitbucket"
    | "linkedin"
    | "apple";

  // Type guard to check if provider is valid
  const isValidProvider = (provider: string): provider is ValidProvider => {
    return [
      "x",
      "github",
      "google",
      "microsoft",
      "spotify",
      "facebook",
      "discord",
      "gitlab",
      "bitbucket",
      "linkedin",
      "apple",
    ].includes(provider as ValidProvider);
  };

  const user = useUser();
  const connectedAcc = isValidProvider(providerName)
    ? user?.useConnectedAccount(providerName, { scopes })
    : undefined;
  const accessToken = connectedAcc?.useAccessToken();

  // Find the OAuth requirement in the module
  const oauthRequirement = module.environmentVariableRequirements.find(
    (req) => req.source === "oauth" && req.oauthProvider === providerName,
  );

  useEffect(() => {
    if (accessToken?.accessToken && oauthRequirement) {
      saveModuleConfiguration(module.id, {
        [oauthRequirement.id]: accessToken?.accessToken,
      });
    } else if (accessToken?.accessToken) {
      // Fallback to legacy behavior
      saveModuleConfiguration(module.id, {
        [module.environmentVariableRequirements[0].id]:
          accessToken?.accessToken,
      });
    }
  }, [module, accessToken, oauthRequirement]);

  return (
    <div className="flex justify-center p-4 w-full mb-4">
      {accessToken?.accessToken ? (
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-center mb-2">
            <p className="font-medium text-sm text-gray-500">Access Token</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                navigator.clipboard.writeText(accessToken.accessToken);
                toast.success("Access token copied to clipboard");
              }}
            >
              <CopyIcon className="mr-1" />
              Copy
            </Button>
          </div>
          <div className="w-full break-all overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <code className="text-xs">{accessToken.accessToken}</code>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {providerName.charAt(0).toUpperCase() + providerName.slice(1)}{" "}
            {serviceName} connected successfully
          </p>
          {!isInDialog && (
            <div className="flex justify-center items-center gap-3 text-center m-4">
              <Button
                type="button"
                variant="outline"
                size="default"
                className="w-full sm:flex-1 sm:max-w-[200px] text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive/90 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (onDelete) {
                    onDelete();
                  }
                }}
              >
                Disconnect
              </Button>

              <Button
                type="button"
                size="default"
                className="w-full sm:flex-1 sm:max-w-[200px] cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (onComplete) {
                    onComplete();
                  } else {
                    // Find closest drawer close button and trigger it
                    const drawerClose = document.querySelector(
                      '[data-drawer-close="true"]',
                    );
                    if (drawerClose) {
                      (drawerClose as HTMLButtonElement).click();
                    }
                  }
                }}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full text-center flex items-center justify-center h-full">
          <Button
            type="button"
            className="flex items-center bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm w-full sm:max-w-[300px]"
            onClick={async () => {
              if (!isValidProvider(providerName)) {
                toast.error(`Unsupported OAuth provider: ${providerName}`);
                return;
              }

              try {
                await user?.getConnectedAccount(providerName, {
                  or: "redirect",
                  scopes,
                });
              } catch (error) {
                toast.error(
                  `Failed to connect to ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} ${serviceName}`,
                );
                console.error(error);
              }
            }}
          >
            <ModuleIcon
              svg={svg}
              darkModeColor={color}
              lightModeColor={color}
            />
            <span>{`Connect ${capitalize(providerName)}`}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
