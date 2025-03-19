"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModuleIcon } from "@/components/module-icon";
import { Markdown } from "@/components/ui/markdown";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsItem } from "@/components/settings";
import { cn } from "@/lib/utils";
import { capitalize } from "@/lib/typography";

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
  module: Module;
  onConfigSave: (
    moduleId: string,
    configs: Record<string, string>,
  ) => Promise<void>;
  defaultOpen?: boolean;
}

export function ModuleConfigDrawer({
  module,
  onConfigSave,
  defaultOpen = false,
}: ModuleConfigDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a schema based on module env var requirements
  const createFormSchema = () => {
    const schemaFields: Record<string, any> = {};

    module.environmentVariableRequirements.forEach((envVar) => {
      if (envVar.required) {
        schemaFields[envVar.id] = z
          .string()
          .min(1, `${envVar.name} is required`);
      } else {
        schemaFields[envVar.id] = z.string().optional();
      }
    });

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
      const response = await fetch(`/api/modules/${module.id}/config`);
      if (!response.ok) throw new Error("Failed to fetch configurations");
      const data = await response.json();
      return data.configurations || [];
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
  const getDefaultValues = () => {
    const defaultValues: Record<string, string> = {};

    module.environmentVariableRequirements.forEach((envVar) => {
      const existingConfig = configData?.find(
        (config: any) => config.environmentVariableRequirementId === envVar.id,
      );

      defaultValues[envVar.id] = existingConfig?.value || "";
    });

    return defaultValues;
  };

  // Setup form with React Hook Form
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
  }, [configData]);

  // Refetch data when dialog opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      await onConfigSave(module.id, data);
      toast.success(`${module.name} configuration saved`);
      setOpen(false);
      // Refetch to update config state after saving
      refetch();
    } catch (error) {
      toast.error(
        `Failed to save configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if module is configured based on the configuration data
  const isConfigured = React.useMemo(() => {
    if (!configData) return false;

    const hasRequiredConfigs = module.environmentVariableRequirements.some(
      (req) => req.required,
    );

    if (hasRequiredConfigs) {
      // If the module has required configs, check that all required ones are filled
      return module.environmentVariableRequirements
        .filter((req) => req.required)
        .every((req) => {
          const config = configData.find(
            (c: any) => c.environmentVariableRequirementId === req.id,
          );
          return config && config.value.trim() !== "";
        });
    } else {
      // If no required configs, then it's configured if any config exists
      return configData.length > 0;
    }
  }, [configData, module.environmentVariableRequirements]);

  return (
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
          className={cn(
            "w-full",
            isConfigured
              ? "bg-green-500/10 hover:bg-green-500/20"
              : "bg-amber-500/10 hover:bg-amber-500/20",
          )}
        >
          {isConfigured ? "Configured" : "Configure"}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-6 pb-8">
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
        </DrawerHeader>

        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading configuration...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
            {module.environmentVariableRequirements.map((envVar) => (
              <SettingsItem
                key={envVar.id}
                title={envVar.name}
                description={envVar.description}
                className={cn(
                  "p-5",
                  envVar.required ? "border-amber-500/30" : "",
                )}
              >
                <div className="w-full max-w-sm">
                  <Input
                    {...register(envVar.id)}
                    type={envVar.public ? "text" : "password"}
                    placeholder={envVar.example}
                    className={errors[envVar.id] ? "border-destructive" : ""}
                  />
                  {errors[envVar.id] && (
                    <p className="text-xs text-destructive mt-1">
                      {errors[envVar.id]?.message}
                    </p>
                  )}
                </div>
              </SettingsItem>
            ))}

            <DrawerFooter className="mt-10">
              <div className="flex w-full sm:justify-center gap-6">
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </DrawerClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? "Saving..." : "Save Configuration"}
                </Button>
              </div>
            </DrawerFooter>
          </form>
        )}
      </DrawerContent>
    </Drawer>
  );
}
