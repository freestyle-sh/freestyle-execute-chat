"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { z, type ZodTypeAny } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModuleIcon } from "@/components/module-icon";
import { Markdown } from "@/components/ui/markdown";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsItem } from "@/components/settings";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/typography";
import { getModuleConfiguration } from "@/actions/modules/get-config";
import { deleteModuleConfiguration } from "@/actions/modules/delete-config";
import {
  CurrentInternalUser,
  CurrentUser,
  User,
  useUser,
} from "@stackframe/stack";
import { GoogleCalendarUI } from "./custom/google-calendar";
import { GoogleSheetsUI } from "./custom/google-sheets";
import { GoogleGmailUI } from "./custom/google-gmail";
import { useTheme } from "next-themes";

type EnvVarRequirement = {
  id: string;
  moduleId: string;
  name: string;
  description: string;
  example: string;
  required: boolean;
  public: boolean;
};

type ModuleConfig = {
  id: string;
  userId: string;
  moduleId: string;
  environmentVariableRequirementId: string;
  value: string;
};

type Module = {
  id: string;
  name: string;
  example: string;
  svg: string;
  lightModeColor: string;
  darkModeColor: string;
  priority: number;
  nodeModules: Record<string, string>;
  documentation: string;
  setupInstructions: string;
  environmentVariableRequirements: EnvVarRequirement[];
  configurations?: ModuleConfig[];
};

interface ModuleConfigDrawerProps {
  module: ModuleWithRequirements;
  onConfigSaveAction: (
    moduleId: string,
    configs: Record<string, string>,
  ) => Promise<void>;
  defaultOpen?: boolean;
}

export function ModuleConfigDrawer({
  module,
  onConfigSaveAction,
  defaultOpen = false,
  _user: user,
}: ModuleConfigDrawerProps & {
  _user: CurrentUser | CurrentInternalUser | null;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resolvedTheme } = useTheme();

  // Create a schema based on module env var requirements
  const createFormSchema = () => {
    const schemaFields: Record<string, ZodTypeAny> = {};

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

  const formSchema = createFormSchema();
  type FormValues = z.infer<typeof formSchema>;

  // Use React Query to fetch module configurations
  const {
    data: configData,
    isLoading,
    error: configError,
    refetch,
  } = useQuery({
    queryKey: ["moduleConfig", module.id],
    queryFn: async () => {
      try {
        const data = await getModuleConfiguration(module.id);
        return data.configurations || [];
      } catch (error) {
        throw new Error("Failed to fetch configurations");
      }
    },
    // Only refetch when dialog opens or module ID changes
    enabled: true,
    // Smaller staleTime for configuration data as it might change
    staleTime: 60 * 1000, // 1 minute
  });

  // Show error toast if fetch fails
  useEffect(() => {
    if (configError) {
      toast.error("Failed to load module configuration");
      console.error(configError);
    }
  }, [configError]);

  // Initialize form with fetched configurations
  const getDefaultValues = useCallback(() => {
    const defaultValues: Record<string, string> = {};

    for (const envVar of module.environmentVariableRequirements) {
      const existingConfig = configData?.find(
        (config) => config.environmentVariableRequirementId === envVar.id,
      );

      defaultValues[envVar.id] = existingConfig?.value || "";
    }

    return defaultValues;
  }, [module.environmentVariableRequirements, configData]);

  // Setup form with React Hook Form
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when configurations load
  useEffect(() => {
    if (configData) {
      reset(getDefaultValues());
    }
  }, [configData, reset, getDefaultValues]);

  // Refetch data when dialog opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Handle form submission with toast.promise
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    toast.promise(
      onConfigSaveAction(module.id, data)
        .then(() => {
          setOpen(false);
          // Invalidate both the module config and modules queries
          queryClient.invalidateQueries({
            queryKey: ["moduleConfig", module.id],
          });
          queryClient.invalidateQueries({ queryKey: ["modules"] });
        })
        .finally(() => {
          setIsSubmitting(false);
        }),
      {
        loading: `Saving ${capitalize(module.name)} configuration...`,
        success: `${capitalize(module.name)} configuration saved successfully`,
        error: (error) =>
          `Failed to save configuration: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
      },
    );
  };

  // State for confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Helper function to handle removing configuration
  const handleRemoveConfiguration = () => {
    setConfirmDialogOpen(true);
  };

  // Function to execute the actual deletion using toast.promise
  const executeConfigurationRemoval = async () => {
    setIsSubmitting(true);

    toast.promise(
      deleteModuleConfiguration(module.id)
        .then(() => {
          setOpen(false);
          // Invalidate both the module config and modules queries
          queryClient.invalidateQueries({
            queryKey: ["moduleConfig", module.id],
          });
          queryClient.invalidateQueries({ queryKey: ["modules"] });
        })
        .finally(() => {
          setIsSubmitting(false);
          setConfirmDialogOpen(false);
        }),
      {
        loading: `Removing ${capitalize(module.name)} configuration...`,
        success: `${capitalize(
          module.name,
        )} configuration removed successfully`,
        error: (error) =>
          `Failed to remove configuration: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
      },
    );
  };

  // Determine if module is configured based on the configuration data
  const isConfigured = React.useMemo(() => {
    if (!configData) {
      return false;
    }

    const hasRequiredConfigs = module.environmentVariableRequirements.some(
      (req) => req.required,
    );

    if (hasRequiredConfigs) {
      // If the module has required configs, check that all required ones are filled
      return module.environmentVariableRequirements
        .filter((req) => req.required)
        .every((req) => {
          const config = configData.find(
            (c) => c.environmentVariableRequirementId === req.id,
          );
          return config && config.value.trim() !== "";
        });
    }
    // If no required configs, then it's configured if any config exists
    return configData.length > 0;
  }, [configData, module.environmentVariableRequirements]);

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        direction="bottom"
        snapPoints={["content"]}
      >
        <DrawerTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            className={cn(
              "w-full",
              isLoading ? "cursor-wait" : "cursor-pointer",
              isConfigured
                ? "bg-green-500/10 hover:bg-green-500/20"
                : resolvedTheme === "dark"
                  ? "bg-amber-500/10 hover:bg-amber-500/20"
                  : "",
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" />
                Loading...
              </span>
            ) : (
              isConfigured ? "Configured" : "Configure"
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-6">
          <DrawerHeader className="pb-6 pt-4">
            <DrawerTitle className="flex items-center justify-center gap-3 text-lg">
              <ModuleIcon
                svg={module.svg}
                lightModeColor={module.lightModeColor}
                darkModeColor={module.darkModeColor}
                size="md"
              />
              {capitalize(module.name)} Configuration
            </DrawerTitle>
            <DrawerDescription className="text-center mt-2 text-sm">
              Configure the environment variables required for {module.name}.
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-auto">
            {module.setupInstructions && (
              <div className="mt-4 p-5 bg-muted/40 rounded-lg border border-border/30 mx-auto max-w-2xl">
                <div className="font-medium text-sm mb-3 text-center uppercase tracking-wide text-muted-foreground">
                  Setup Instructions
                </div>
                <Markdown className="prose prose-sm dark:prose-invert max-w-none [&>p]:text-sm [&>ul]:text-sm [&>ol]:text-sm">
                  {module.setupInstructions}
                </Markdown>
              </div>
            )}

            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
                <p className="text-sm text-muted-foreground">
                  Loading configuration...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
                {module._specialBehavior == null && (
                  <div className="flex flex-col gap-4 py-6">
                    {module.environmentVariableRequirements.map((envVar) => (
                      <SettingsItem
                        key={envVar.id}
                        title={envVar.name}
                        description={envVar.description ?? undefined}
                        className={cn(
                          "p-5",
                          envVar.required ? "border-amber-500/30" : "",
                        )}
                      >
                        <div className="w-full lg:w-3/4 lg:ml-auto">
                          <Input
                            {...register(envVar.id)}
                            type={envVar.public ? "text" : "password"}
                            placeholder={envVar.example ?? undefined}
                            className={cn(
                              "w-full",
                              errors[envVar.id] ? "border-destructive" : "",
                            )}
                          />
                          {errors[envVar.id] && (
                            <p className="text-xs text-destructive mt-1">
                              {
                                (errors[envVar.id]?.message ??
                                  "Unknown") as string
                              }
                            </p>
                          )}
                        </div>
                      </SettingsItem>
                    ))}
                    <DrawerFooter className="px-4 sm:px-6">
                      <div className="flex flex-col w-full">
                        {/* Main button row with action buttons */}
                        <div className="flex flex-col sm:flex-row w-full items-center justify-center gap-3">
                          {/* Dynamic button: Cancel or Delete based on configuration state */}
                          {isConfigured ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="default"
                              className="w-full sm:flex-1 sm:max-w-[200px] text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive/90 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveConfiguration();
                              }}
                            >
                              Delete Configuration
                            </Button>
                          ) : (
                            <DrawerClose asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                className="w-full sm:flex-1 sm:max-w-[200px] cursor-pointer"
                              >
                                Cancel
                              </Button>
                            </DrawerClose>
                          )}

                          {/* Save button stays the same */}
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            size="default"
                            className="w-full sm:flex-1 sm:max-w-[200px] cursor-pointer"
                          >
                            {isSubmitting ? "Saving..." : "Save Configuration"}
                          </Button>
                        </div>
                      </div>
                    </DrawerFooter>
                  </div>
                )}
                {module._specialBehavior === "google-calendar" && (
                  <GoogleCalendarUI module={module} />
                )}
                {module._specialBehavior === "google-sheets" && (
                  <GoogleSheetsUI module={module} />
                )}
                {module._specialBehavior === "google-gmail" && (
                  <GoogleGmailUI module={module} />
                )}
              </form>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Removal</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to remove all configuration for ${capitalize(
                module.name,
              )}? This action cannot be undone.`}
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
              disabled={isSubmitting}
              onClick={executeConfigurationRemoval}
              className="cursor-pointer"
            >
              {isSubmitting ? "Removing..." : "Remove Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
