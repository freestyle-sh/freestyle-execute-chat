import { ModuleIcon } from "../module-icon";
import { siGooglesheets } from "simple-icons";
import { Button } from "../ui/button";
import { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { useUser } from "@stackframe/stack";
import { toast } from "sonner";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { useEffect } from "react";
import { DrawerClose } from "../ui/drawer";

export function GoogleSheetsUI(props: {
  module: ModuleWithRequirements;
}): React.ReactNode {
  const user = useUser();
  const connectedAcc = user?.useConnectedAccount("google", {
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const accessToken = connectedAcc?.useAccessToken();

  useEffect(() => {
    if (accessToken?.accessToken) {
      saveModuleConfiguration(
        props.module.id,
        {
          [props.module.environmentVariableRequirements[0].id]:
            accessToken?.accessToken,
        }
      );
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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy
            </Button>
          </div>
          <div className="w-full break-all overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <code className="text-xs">{accessToken.accessToken}</code>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Google Sheets connected successfully
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
          <DrawerClose asChild>
            <Button
              type="button"
              variant="outline"
              size="default"
              className="w-full sm:max-w-[300px] cursor-pointer"
            >
              Cancel
            </Button>
          </DrawerClose>
          <Button
            type="button"
            className="flex items-center bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm w-full sm:max-w-[300px]"
            onClick={async () => {
              try {
                await user?.getConnectedAccount("google", {
                  or: "redirect",
                  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
                });
              } catch (error) {
                toast.error("Failed to connect to Google Sheets");
                console.error(error);
              }
            }}
          >
            <ModuleIcon
              svg={siGooglesheets.svg}
              darkModeColor={siGooglesheets.hex}
              lightModeColor={siGooglesheets.hex}
            />
            <span>Connect Google Sheets</span>
          </Button>
        </div>
      )}
    </div>
  );
}