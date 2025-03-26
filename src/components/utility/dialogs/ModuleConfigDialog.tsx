"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ModuleIcon } from "@/components/module-icon";
import { capitalize } from "@/lib/typography";
import { useDialogStore } from "./store";
import type { ModuleWithRequirements } from "@/actions/modules/list-modules";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getModuleConfiguration } from "@/actions/modules/get-config";
import { useUser } from "@stackframe/stack";
import { GoogleCalendarUI } from "@/components/custom/google-calendar";
import { GoogleSheetsUI } from "@/components/custom/google-sheets";
import { GoogleGmailUI } from "@/components/custom/google-gmail";

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
  const { resolveDialog } = useDialogStore();
  const queryClient = useQueryClient();
  const user = useUser();
  
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

  // Use a dynamic schema with a Record to avoid TypeScript errors with unknown fields
  const formSchema = currentModule 
    ? createFormSchema(currentModule) 
    : z.object({});
  
  // This allows for dynamic fields based on the current module
  type FormValues = Record<string, string>;

  // Initialize form with existing configurations if available
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (!currentModule || initialized.current) return;
    
    const fetchConfig = async () => {
      try {
        const data = await getModuleConfiguration(currentModule.id);
        const defaults: Record<string, string> = {};
        
        for (const envVar of currentModule.environmentVariableRequirements) {
          const existingConfig = data.configurations?.find(
            (config) => config.environmentVariableRequirementId === envVar.id
          );
          defaults[envVar.id] = existingConfig?.value || "";
        }
        
        setDefaultValues(defaults);
        reset(defaults);
        initialized.current = true;
      } catch (error) {
        console.error("Failed to fetch module configuration", error);
        // Initialize with empty values if fetch fails
        const defaults: Record<string, string> = {};
        currentModule.environmentVariableRequirements.forEach(envVar => {
          defaults[envVar.id] = "";
        });
        setDefaultValues(defaults);
        reset(defaults);
        initialized.current = true;
      }
    };
    
    fetchConfig();
  }, [currentModule]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  });

  // Reset form when moving to next module
  useEffect(() => {
    if (currentModule) {
      initialized.current = false;
    }
  }, [currentModuleIndex, currentModule]);

  const onSubmit = async (data: FormValues) => {
    if (!currentModule) return;
    
    setIsConfiguring(true);
    
    try {
      await saveModuleConfiguration(currentModule.id, data);
      
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ["moduleConfig", currentModule.id],
      });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      
      // Add to configured modules list
      setConfiguredModules([...configuredModules, currentModule.id]);
      
      // Move to next module or complete
      if (currentModuleIndex < modules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
        initialized.current = false;
      } else {
        // All modules configured
        toast.success("All modules configured successfully");
        resolveDialog(true);
      }
    } catch (error) {
      toast.error(`Configuration failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      initialized.current = false;
    } else {
      // All modules configured
      toast.success("All modules configured successfully");
      resolveDialog(true);
    }
  };

  // If no modules or all modules configured
  if (!modules.length) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{dialog.title}</DialogTitle>
          <DialogDescription>No modules require configuration</DialogDescription>
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

  // Check if the current module has special OAuth behavior
  const hasSpecialOAuthBehavior = typeof currentModule._specialBehavior === 'string' && currentModule._specialBehavior.startsWith('google-');

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
          {!hasSpecialOAuthBehavior && currentModule.environmentVariableRequirements.some(r => r.required)
            ? " Required fields are marked."
            : " No required fields."}
        </DialogDescription>
        {/* Progress indicator */}
        <div className="w-full mt-2 bg-secondary/30 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-in-out" 
            style={{ 
              width: `${((currentModuleIndex + 1) / modules.length) * 100}%` 
            }}
          />
        </div>
      </DialogHeader>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 animate-in fade-in slide-in-from-right-5 duration-300">
        {/* Render standard form fields if no special behavior */}
        {!hasSpecialOAuthBehavior && currentModule.environmentVariableRequirements.map((envVar) => (
          <div key={envVar.id} className="space-y-2">
            <div className="flex justify-between">
              <label 
                htmlFor={envVar.id} 
                className={cn(
                  "text-sm font-medium",
                  envVar.required ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""
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
                envVar.required ? "border-amber-500/30" : ""
              )}
            />
            {envVar.description && (
              <p className="text-xs text-muted-foreground">{envVar.description}</p>
            )}
            {errors[envVar.id] && (
              <p className="text-xs text-destructive">
                {errors[envVar.id]?.message as string}
              </p>
            )}
          </div>
        ))}

        {/* Render special OAuth UI components */}
        {currentModule._specialBehavior === "google-calendar" && (
          <div className="py-4">
            <GoogleCalendarUI module={currentModule} />
          </div>
        )}
        {currentModule._specialBehavior === "google-sheets" && (
          <div className="py-4">
            <GoogleSheetsUI module={currentModule} />
          </div>
        )}
        {currentModule._specialBehavior === "google-gmail" && (
          <div className="py-4">
            <GoogleGmailUI module={currentModule} />
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
            
            {hasSpecialOAuthBehavior ? (
              <Button
                type="button"
                disabled={isConfiguring}
                onClick={handleNextModule}
              >
                {currentModuleIndex < modules.length - 1 ? "Next" : "Finish"}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isConfiguring || !isValid}
              >
                {isConfiguring 
                  ? "Saving..." 
                  : currentModuleIndex < modules.length - 1 
                    ? "Save & Next" 
                    : "Finish"
                }
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </>
  );
}