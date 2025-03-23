"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { SettingsSection } from "@/components/settings";
import { ModuleConfigDrawer } from "@/components/module-config";
import { ModuleIcon } from "@/components/module-icon";
import { listModules } from "@/actions/modules/list-modules";
import { Skeleton } from "@/components/ui/skeleton";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { useUser } from "@stackframe/stack";

interface ModulesSettingsProps {
  moduleToOpen?: string | null;
}

export function ModulesSettings({ moduleToOpen }: ModulesSettingsProps = {}) {
  const queryClient = useQueryClient();

  const user = useUser();

  const {
    data: modules,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

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
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
          Failed to load modules. Please try again later.
        </div>
      </SettingsSection>
    );
  }

  if (!isLoading && (!modules || modules.length === 0)) {
    return (
      <SettingsSection title="Module Configurations">
        <div className="p-4 rounded-lg text-sm text-muted-foreground">
          No modules available for configuration.
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Module Configurations"
      description="Configure your modules to use external services and APIs"
    >
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : null}
        {modules?.map((module) => (
          <div
            key={module.id}
            className="p-4 bg-background/50 rounded-lg border border-border flex items-start justify-between gap-4"
          >
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
                          req.required
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {req.name}
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
                  _user={user}
                  defaultOpen={moduleToOpen === module.id}
                />
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  No configuration needed
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
