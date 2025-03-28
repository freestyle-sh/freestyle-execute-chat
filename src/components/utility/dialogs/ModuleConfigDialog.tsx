"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ModuleIcon } from "@/components/module-icon";
import { capitalize } from "@/lib/typography";
import { useDialogStore } from "./store";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getModuleConfiguration } from "@/actions/modules/get-config";
import { deleteModuleConfiguration } from "@/actions/modules/delete-config";
import { useUser } from "@stackframe/stack";
import { useModulesStore } from "@/stores/modules";
import { useParams } from "next/navigation";
import { OAuthUI } from "@/components/custom/oauth";

interface ModuleConfigDialogProps {
  dialog: {
    title: React.ReactNode;
    message: React.ReactNode;
    modules: ModuleWithRequirements[];
  };
}

export function ModuleConfigDialog({ dialog }: ModuleConfigDialogProps) {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [configuredModules, setConfiguredModules] = useState<string[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const { resolveDialog } = useDialogStore();
  const queryClient = useQueryClient();

  const toggleModule = useModulesStore((state) => state.toggleModule);
  const params = useParams<{ chat?: string }>();
  const chatId = params.chat;

  const modules = dialog.modules || [];
  const currentModule = modules[currentModuleIndex];

  // Create a schema based on module env var requirements
  const createFormSchema = (module: ModuleWithRequirements) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    for (const envVar of module.environmentVariableRequirements) {
      if (envVar.required) {
        schemaFields[envVar.id] = z
          .string()
          .min(1, `${envVar.name} is required`);
      } else {
        schemaFields[envVar.id] = z.string().optional();
      }
    }

    return z.object(schemaFields);
  };

  const formSchema = createFormSchema(currentModule);

  const { data: moduleConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ["moduleConfig", currentModule?.id],
    queryFn: async () => {
      if (!currentModule) {
        return null;
      }
      return getModuleConfiguration(currentModule.id);
    },
    enabled: !!currentModule,
    staleTime: 30000, // 30 seconds
  });

  // Compute default values based on fetched configuration
  const defaultValues = useMemo(() => {
    const defaults: Record<string, string> = {};

    if (currentModule && moduleConfig) {
      // Set form values from existing configuration
      for (const envVar of currentModule.environmentVariableRequirements) {
        const existingConfig = moduleConfig.configurations?.find(
          (config: {
            environmentVariableRequirementId: string;
            value: string;
          }) => config.environmentVariableRequirementId === envVar.id,
        );
        defaults[envVar.id] = existingConfig?.value || "";
      }
    } else if (currentModule) {
      // If no config yet or loading/error, initialize with empty values
      for (const envVar of currentModule.environmentVariableRequirements) {
        defaults[envVar.id] = "";
      }
    }

    return defaults;
  }, [currentModule, moduleConfig]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  // Reset form when module or moduleConfig changes
  useEffect(() => {
    if (currentModule) {
      reset(defaultValues);
    }
  }, [currentModule, defaultValues, reset]);

  const onSubmit = async (data: Record<string, string>) => {
    if (!currentModule) {
      return;
    }

    setIsConfiguring(true);

    try {
      await saveModuleConfiguration(currentModule.id, data);

      // Add to configured modules list
      setConfiguredModules([...configuredModules, currentModule.id]);

      // Update the Zustand store to enable this module by default after configuration
      toggleModule(currentModule.id, true);

      // Optimistically update all module query cache entries
      // First update the homepage version (for non-persisted chats)
      queryClient.setQueryData(
        ["modules", "homepage"],
        (old: ModuleWithRequirements[] | undefined) => {
          if (!old) return [];
          return old.map((module) => {
            if (module.id === currentModule.id) {
              return {
                ...module,
                isConfigured: true,
                isEnabled: true,
              };
            }
            return module;
          });
        },
      );

      // Then invalidate any other specific chat module queries to refresh them
      queryClient.invalidateQueries({
        queryKey: ["moduleConfig", currentModule.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["modules", chatId],
        exact: false,
      });

      // Move to next module or complete
      if (currentModuleIndex < modules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
      } else {
        resolveDialog(true);
      }
    } catch (error) {
      toast.error(
        `Configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleNextModule = () => {
    // If there's a current module, make sure it's enabled in the store
    if (currentModule) {
      // Update the Zustand store to enable this module after OAuth flow
      toggleModule(currentModule.id, true);

      // Optimistically update all module query cache entries
      // First update the homepage version (for non-persisted chats)
      queryClient.setQueryData(
        ["modules", "homepage"],
        (old: ModuleWithRequirements[] | undefined) => {
          if (!old) return [];
          return old.map((module) => {
            if (module.id === currentModule.id) {
              return {
                ...module,
                isConfigured: true,
                isEnabled: true,
              };
            }
            return module;
          });
        },
      );

      // Then invalidate any other specific chat module queries to refresh them
      queryClient.invalidateQueries({
        queryKey: ["moduleConfig", currentModule.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["modules", chatId],
        exact: false,
      });
    }

    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
    } else {
      resolveDialog(true);
    }
  };

  const handleRemoveConfiguration = () => {
    setConfirmDialogOpen(true);
  };

  const executeConfigurationRemoval = async () => {
    if (!currentModule) return;

    setIsConfiguring(true);

    toast.promise(
      deleteModuleConfiguration(currentModule.id)
        .then(() => {
          // Update the Zustand store to disable this module
          toggleModule(currentModule.id, false);

          // Optimistically update all module query cache entries
          // First update the homepage version (for non-persisted chats)
          queryClient.setQueryData(
            ["modules", "homepage"],
            (old: ModuleWithRequirements[] | undefined) => {
              if (!old) return [];
              return old.map((module) => {
                if (module.id === currentModule.id) {
                  return {
                    ...module,
                    isConfigured: false,
                    isEnabled: false,
                  };
                }
                return module;
              });
            },
          );

          // Then invalidate any other specific chat module queries to refresh them
          queryClient.invalidateQueries({
            queryKey: ["moduleConfig", currentModule.id],
          });
          queryClient.invalidateQueries({
            queryKey: ["modules", chatId],
            exact: false,
          });

          // If there are more modules, proceed to the next one
          // otherwise complete the dialog
          if (currentModuleIndex < modules.length - 1) {
            setCurrentModuleIndex(currentModuleIndex + 1);
          } else {
            resolveDialog(true);
          }
        })
        .finally(() => {
          setIsConfiguring(false);
          setConfirmDialogOpen(false);
        }),
      {
        loading: `Removing ${capitalize(currentModule.name)} configuration...`,
        success: `${capitalize(currentModule.name)} configuration removed successfully`,
        error: (error) =>
          `Failed to remove configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
    );
  };

  // If no modules or all modules configured
  if (!modules.length) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{dialog.title}</DialogTitle>
          <DialogDescription>
            No modules require configuration
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => resolveDialog(true)}>Close</Button>
        </DialogFooter>
      </>
    );
  }

  // If we have a current module to configure
  if (!currentModule) {
    resolveDialog(false);
    return null;
  }

  // Check if the current module has OAuth requirements
  const hasOAuthRequirements =
    currentModule.environmentVariableRequirements.some(
      (req) => req.source === "oauth",
    );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ModuleIcon
            svg={currentModule.svg}
            lightModeColor={currentModule.lightModeColor}
            darkModeColor={currentModule.darkModeColor}
            size="sm"
            className="w-5 h-5"
          />
          Configure {capitalize(currentModule.name)}
        </DialogTitle>
        <DialogDescription>
          {currentModuleIndex + 1} of {modules.length} -
          {!hasOAuthRequirements &&
          currentModule.environmentVariableRequirements.some((r) => r.required)
            ? " Required fields are marked."
            : " No required fields."}
        </DialogDescription>
        {/* Progress indicator */}
        <div className="w-full mt-2 bg-secondary/30 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentModuleIndex + 1) / modules.length) * 100}%`,
            }}
          />
        </div>
      </DialogHeader>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-4 animate-in fade-in slide-in-from-right-5 duration-300"
      >
        {/* Show loading state when fetching config */}
        {isLoadingConfig && !hasOAuthRequirements && (
          <div className="space-y-4 animate-pulse">
            <div className="h-5 w-1/3 bg-muted rounded-md" />
            <div className="h-10 w-full bg-muted rounded-md" />
            <div className="h-5 w-1/2 bg-muted rounded-md" />
            <div className="h-10 w-full bg-muted rounded-md" />
          </div>
        )}

        {/* Render standard form fields for text-entry requirements */}
        {!isLoadingConfig &&
          currentModule.environmentVariableRequirements
            .filter((envVar) => envVar.source === "text")
            .map((envVar) => (
              <div key={envVar.id} className="space-y-2">
                <div className="flex justify-between">
                  <label
                    htmlFor={envVar.id}
                    className={cn(
                      "text-sm font-medium",
                      envVar.required
                        ? "after:content-['*'] after:ml-0.5 after:text-destructive"
                        : "",
                    )}
                  >
                    {envVar.name}
                  </label>
                </div>
                <Input
                  id={envVar.id}
                  {...register(envVar.id)}
                  type={envVar.public ? "text" : "password"}
                  placeholder={envVar.example || ""}
                  className={cn(
                    errors[envVar.id] ? "border-destructive" : "",
                    envVar.required ? "border-amber-500/30" : "",
                  )}
                />
                {envVar.description && (
                  <p className="text-xs text-muted-foreground">
                    {envVar.description}
                  </p>
                )}
                {errors[envVar.id] && (
                  <p className="text-xs text-destructive">
                    {errors[envVar.id]?.message as string}
                  </p>
                )}
              </div>
            ))}

        {/* Render OAuth UI components for OAuth requirements */}
        {hasOAuthRequirements && (
          <div className="py-4">
            {currentModule.environmentVariableRequirements
              .filter((req) => req.source === "oauth")
              .map((req) => {
                if (!req.oauthProvider) {
                  throw new Error("Expected oauthProvider to be non-null");
                }

                return (
                  <OAuthUI
                    key={req.id}
                    module={currentModule}
                    serviceName={req.name}
                    providerName={req.oauthProvider}
                    svg={currentModule.svg}
                    color={currentModule.darkModeColor}
                    scopes={req.oauthScopes || []}
                    isInDialog={true}
                    onCancel={() => resolveDialog(false)}
                    onDelete={handleRemoveConfiguration}
                    onComplete={handleNextModule}
                  />
                );
              })}
          </div>
        )}

        <DialogFooter className="pt-4">
          <div className="flex w-full justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => resolveDialog(false)}
              disabled={isConfiguring}
            >
              Cancel
            </Button>

            {hasOAuthRequirements ? (
              <div className="flex gap-2">
                {currentModule.isConfigured && (
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive/90 cursor-pointer"
                    onClick={handleRemoveConfiguration}
                    disabled={isConfiguring || isLoadingConfig}
                  >
                    Disconnect
                  </Button>
                )}
                <Button
                  type="button"
                  disabled={isConfiguring || isLoadingConfig}
                  onClick={handleNextModule}
                >
                  {currentModuleIndex < modules.length - 1 ? "Next" : "Finish"}
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isConfiguring || isLoadingConfig || !isValid}
              >
                {isConfiguring
                  ? "Saving..."
                  : isLoadingConfig
                    ? "Loading..."
                    : currentModuleIndex < modules.length - 1
                      ? "Save & Next"
                      : "Finish"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>

      {/* Confirmation Dialog for deleting configuration */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Configuration Removal</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to remove the configuration for ${currentModule ? capitalize(currentModule.name) : "this module"}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:justify-center">
            <DialogClose asChild>
              <Button
                className="cursor-pointer"
                type="button"
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isConfiguring}
              onClick={executeConfigurationRemoval}
              className="cursor-pointer"
            >
              {isConfiguring ? "Removing..." : "Remove Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
