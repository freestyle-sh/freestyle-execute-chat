import { ModuleIcon } from "../module-icon";
import { Button } from "../ui/button";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { useEffect } from "react";
import { CopyIcon } from "lucide-react";

export interface GoogleOAuthUIProps {
  module: ModuleWithRequirements;
  serviceName: string;
  svg: string;
  color: string;
  scopes: string[];
}

export function GoogleOAuthUI({
  module,
  serviceName,
  svg,
  color,
  scopes,
}: GoogleOAuthUIProps): React.ReactNode {
  const user = useUser();
  const connectedAcc = user?.useConnectedAccount("google", {
    scopes,
  });
  const accessToken = connectedAcc?.useAccessToken();

  useEffect(() => {
    if (accessToken?.accessToken) {
      saveModuleConfiguration(module.id, {
        [module.environmentVariableRequirements[0].id]: accessToken?.accessToken,
      });
    }
  });

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
            Google {serviceName} connected successfully
          </p>
          <div className="text-center m-4">
            <Button
              type="submit"
              size="default"
              className="w-full sm:flex-1 sm:max-w-[200px] cursor-pointer"
            >
              Ok
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 w-full text-center flex items-center justify-center h-full flex-col sm:flex-row ">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="w-full sm:max-w-[300px] cursor-pointer"
            onClick={(e) => {
              // Find closest drawer or dialog close button and trigger it
              const drawerClose = document.querySelector(
                '[data-drawer-close="true"]'
              );
              const dialogClose = document.querySelector(
                '[data-dialog-close="true"]'
              );

              if (drawerClose) {
                (drawerClose as HTMLButtonElement).click();
              } else if (dialogClose) {
                (dialogClose as HTMLButtonElement).click();
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex items-center bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm w-full sm:max-w-[300px]"
            onClick={async () => {
              try {
                await user?.getConnectedAccount("google", {
                  or: "redirect",
                  scopes,
                });
              } catch (error) {
                toast.error(`Failed to connect to Google ${serviceName}`);
                console.error(error);
              }
            }}
          >
            <ModuleIcon
              svg={svg}
              darkModeColor={color}
              lightModeColor={color}
            />
            <span>Connect Google {serviceName}</span>
          </Button>
        </div>
      )}
    </div>
  );
}