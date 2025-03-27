"use client";

import { useState } from "react";
import { ModuleIcon } from "@/components/module-icon";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { useModulesStore } from "@/stores/modules";
import { useRouter } from "next/navigation";
import { confirm, configureModules } from "@/components/utility/dialogs/index";
import { capitalize } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface ExamplePromptProps {
  title: string;
  description: string;
  promptText: string;
  moduleNames: string[];
  modules?: ModuleWithRequirements[];
  onSelectAction: (promptText: string) => void;
}

function ModuleInfoContent({ modules }: { modules: ModuleWithRequirements[] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium">
        {"The following modules need to be configured to run this example"}
      </span>
      <div className="space-y-2">
        {modules.map((module) => (
          <div
            key={module.id}
            className="flex items-center justify-between gap-2 p-2 bg-secondary/50 rounded-md"
          >
            <div className="flex flex-row gap-2">
              <ModuleIcon
                svg={module.svg}
                lightModeColor={module.lightModeColor}
                darkModeColor={module.darkModeColor}
                size="sm"
                className="!w-5 !h-5"
              />
              <span className="font-medium text-sm">
                {capitalize(module.name)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {"Not configured"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExamplePrompt({
  title,
  description,
  promptText,
  moduleNames,
  modules,
  onSelectAction,
}: ExamplePromptProps) {
  const router = useRouter();
  const toggleModule = useModulesStore((state) => state.toggleModule);
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    try {
      if (modules && moduleNames.length > 0) {
        const foundModules = moduleNames
          .map((moduleName) => modules.find((m) => m.name === moduleName))
          .filter((m) => m !== undefined) as ModuleWithRequirements[];

        const unconfiguredModules = foundModules.filter(
          (module) => !module.isConfigured,
        );

        if (unconfiguredModules.length > 0) {
          // Ask user if they want to configure modules now
          const confirmation = await confirm(
            "Module Configuration Required",
            <ModuleInfoContent modules={unconfiguredModules} />,
            {
              okButton: {
                text: "Configure",
              },
            },
          );

          if (confirmation) {
            // Show module configuration dialog for each unconfigured module
            const success = await configureModules(unconfiguredModules);

            if (!success) {
              return; // User canceled configuration
            }

            // Refresh modules to get updated configuration status
            // This is handled by queryClient invalidation in the dialog
          } else {
            return; // User canceled
          }
        }

        try {
          // Enable all required modules
          for (const moduleName of moduleNames) {
            const module = modules.find((m) => m.name === moduleName);
            if (module) {
              toggleModule(module.id, true);
            }
          }

          // Set the prompt
          onSelectAction(promptText);
        } catch {}
      } else {
        // No modules required, just set the prompt
        onSelectAction(promptText);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const modulesLoading = !modules || isLoading;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "cursor-pointer p-3 text-sm text-left border rounded-xl transition-all hover:bg-secondary/50",
        isLoading ? "opacity-70 pointer-events-none" : "",
      )}
    >
      <div className="flex-1">
        <div className="flex justify-between items-center">
          {modulesLoading ? (
            <Skeleton className="h-5 w-24 bg-muted/30 rounded animate-pulse" />
          ) : (
            <span className="font-medium h-5">{title}</span>
          )}
        </div>
        {modulesLoading ? (
          <Skeleton className="h-3 w-full mt-2 bg-muted/30 rounded animate-pulse" />
        ) : (
          <span className="text-xs text-muted-foreground h-3">
            {description}
          </span>
        )}
        <div className="flex gap-1 mt-1.5 items-center h-4">
          {moduleNames.length > 0 ? (
            <>
              {modules && !isLoading ? (
                moduleNames.map((moduleName) => {
                  const foundModule = modules.find(
                    (m) => m.name === moduleName,
                  );

                  if (foundModule) {
                    return (
                      <div
                        key={foundModule.id}
                        className={"relative group"}
                        title={`${foundModule.name}${!foundModule.isConfigured ? " (Not configured)" : ""}`}
                      >
                        <ModuleIcon
                          svg={foundModule.svg}
                          lightModeColor={foundModule.lightModeColor}
                          darkModeColor={foundModule.darkModeColor}
                          size="sm"
                          className="w-4 h-4"
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 px-2 py-1 bg-secondary text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-10">
                          {foundModule.name}
                          {!foundModule.isConfigured ? " (Not configured)" : ""}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Skeleton
                      key={moduleName}
                      className="w-4 h-4 rounded-full bg-muted/30"
                    />
                  );
                })
              ) : (
                <Skeleton className="w-4 h-4 rounded-full bg-muted/30" />
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              No modules required
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
