"use client";

import {
  useQuery,
  useMutation,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query";
import { getModuleConfiguration } from "@/actions/modules/get-config";

import { SettingsSection } from "@/components/settings";
import { ModuleConfigDrawer } from "@/components/module-config";
import { ModuleIcon } from "@/components/module-icon";
import {
  listModules,
  ModuleWithRequirements,
} from "@/actions/modules/list-modules";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { useUser } from "@stackframe/stack";
import { Suspense, useMemo } from "react";

interface ModulesSettingsProps {
  moduleToOpen?: string | null;
}

export function ModulesSettings({ moduleToOpen }: ModulesSettingsProps = {}) {
  const queryClient = useQueryClient();

  const {
    data: modules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

  const moduleMap = modules
    ?.filter((module) => module.environmentVariableRequirements.length > 0)
    .reduce(
      (
        acc: Record<string, ModuleWithRequirements>,
        news: ModuleWithRequirements,
      ) => {
        acc[news.id] = news;
        return acc;
      },
      {},
    );

  const mutation = useMutation({
    mutationFn: ({
      moduleId,
      configs,
    }: {
      moduleId: string;
      configs: Record<string, string>;
    }) => saveModuleConfiguration(moduleId, configs),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["moduleConfig", variables.moduleId],
      });
    },
  });

  const handleConfigSave = async (
    moduleId: string,
    configs: Record<string, string>,
  ) => {
    await mutation.mutateAsync({ moduleId, configs });
  };

  if (error) {
    return (
      <SettingsSection title="Module Configurations">
        <Card className="p-6">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg text-sm p-4">
            Failed to load modules. Please try again later.
          </div>
        </Card>
      </SettingsSection>
    );
  }

  if (!isLoading && (!modules || modules.length === 0)) {
    return (
      <SettingsSection title="Module Configurations">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">
            No modules available for configuration.
          </div>
        </Card>
      </SettingsSection>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        modules?.map((module) => {
          // Check if module has OAuth requirements
          const hasOAuth = module.environmentVariableRequirements.some(
            (req) => req.source === "oauth"
          );
          
          return (
            <Card key={module.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <ModuleIcon
                    svg={module.svg}
                    lightModeColor={module.lightModeColor}
                    darkModeColor={module.darkModeColor}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-medium">{`${module.name
                      .slice(0, 1)
                      .toUpperCase()}${module.name.slice(1)}`}</h3>
                    <p className="text-sm text-muted-foreground">
                      {module.example}
                    </p>
                    {module.environmentVariableRequirements.length > 0 && (
                      <div className="mt-1 flex gap-1.5 flex-wrap">
                        {module.environmentVariableRequirements.map((req) => (
                          <span
                            key={req.id}
                            className={`text-xs px-1.5 py-0.5 rounded-sm ${
                              req.source === "oauth"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                : req.required
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {req.source === "oauth" ? `${req.name} (OAuth)` : req.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-28 shrink-0">
                  {module.environmentVariableRequirements.length > 0 ? (
                    <ModuleConfigDrawer
                      module={module}
                      onConfigSaveAction={handleConfigSave}
                      defaultOpen={moduleToOpen === module.id}
                      isConfigLoading={isLoading}
                      configData={moduleMap?.[module.id]?.configurations ?? []}
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground italic">
                      No configuration needed
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
