"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import { z, type ZodTypeAny } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModuleIcon } from "@/components/module-icon";
import { Markdown } from "@/components/ui/markdown";
import { AuthPopup } from "@/components/ui/auth-popup";
import type {
  EnvVarRequirement,
  ModuleConfigVar,
  ModuleWithRequirements,
} from "@/actions/modules/list-modules";

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
import { deleteModuleConfiguration } from "@/actions/modules/delete-config";
import { saveModuleConfiguration } from "@/actions/modules/set-config";
import { useUser } from "@stackframe/stack";
import { useTheme } from "next-themes";
import { CopyIcon, Loader2 } from "lucide-react";

interface ModuleConfigDrawerProps {
  module: ModuleWithRequirements;
  onConfigSaveAction: (
    moduleId: string,
    configs: Record<string, string>,
  ) => Promise<void>;
  defaultOpen?: boolean;
  isConfigLoading?: boolean;
  configData: ModuleConfigVar[];
}

// Create a schema based on module env var requirements
function createFormSchema(requirements: EnvVarRequirement[]) {
  const schemaFields: Record<string, ZodTypeAny> = {};

  for (const envVar of requirements) {
    if (envVar.required) {
      schemaFields[envVar.id] = z.string().min(1, `${envVar.name} is required`);
    } else {
      schemaFields[envVar.id] = z.string().optional();
    }
  }

  return z.object(schemaFields);
}

function ModuleConfigTrigger({
  module,
  isConfigLoading,
}: {
  module: ModuleWithRequirements;
  isConfigLoading: boolean;
}) {
  const { resolvedTheme } = useTheme();

  // Get configured status
  const hasOAuthRequirements = module.environmentVariableRequirements.some(
    (req) => req.source === "oauth",
  );

  return (
    <DrawerTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        disabled={isConfigLoading}
        className={cn(
          "w-full",
          isConfigLoading ? "cursor-wait" : "cursor-pointer",
          module.isConfigured
            ? "bg-green-500/10 hover:bg-green-500/20"
            : resolvedTheme === "dark"
              ? "bg-amber-500/10 hover:bg-amber-500/20"
              : "",
        )}
      >
        {isConfigLoading ? (
          <span className="flex items-center gap-2">
            <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" />
            Loading...
          </span>
        ) : module.isConfigured ? (
          hasOAuthRequirements ? (
            "Connected"
          ) : (
            "Configured"
          )
        ) : hasOAuthRequirements ? (
          "Connect"
        ) : (
          "Configure"
        )}
      </Button>
    </DrawerTrigger>
  );
}

// OAuth UI component for a specific provider
function OAuthConfigUI({
  envVar,
  module,
  onRemoveConfig,
}: {
  envVar: EnvVarRequirement;
  module: ModuleWithRequirements;
  onRemoveConfig: () => void;
}) {
  // Check if the OAuth provider is valid for Stack Auth
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
  const validProviders: ValidProvider[] = [
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
  ];

  // Type guard to make sure provider is valid
  const isValidProvider = (provider: string): provider is ValidProvider => {
    return validProviders.includes(provider as ValidProvider);
  };

  // Always call all Hooks at the top level
  const user = useUser();
  // Setup values needed for hooks and conditional logic
  const validProvider =
    envVar.source === "oauth" &&
    envVar.oauthProvider &&
    isValidProvider(envVar.oauthProvider)
      ? (envVar.oauthProvider as ValidProvider)
      : null;
  const providerScopes =
    envVar.source === "oauth" && envVar.oauthScopes ? envVar.oauthScopes : [];

  // Always initialize hooks safely at the top level
  const connectedAcc = validProvider
    ? user?.useConnectedAccount(validProvider, { scopes: providerScopes })
    : null;
  const accessToken = connectedAcc?.useAccessToken();

  // Always call useEffect at the top level, regardless of conditions
  useEffect(() => {
    if (accessToken?.accessToken && envVar.id) {
      saveModuleConfiguration(module.id, {
        [envVar.id]: accessToken.accessToken,
      });
    }
  }, [accessToken?.accessToken, envVar.id, module.id]);

  // Early return checks after hooks
  if (
    envVar.source !== "oauth" ||
    !envVar.oauthProvider ||
    !envVar.oauthScopes
  ) {
    return null;
  }

  // Show error for unsupported providers
  if (!validProvider) {
    return (
      <div className="p-4 text-center">
        <div className="text-destructive">
          Unsupported OAuth provider: {envVar.oauthProvider}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          This provider is not supported by the authentication system.
        </p>
      </div>
    );
  }

  const providerName = capitalize(envVar.oauthProvider.toLowerCase());
  const serviceName = envVar.name;

  return (
    <div className="flex justify-center p-4 w-full mb-4">
      {accessToken?.accessToken ? (
        <div className="w-full max-w-xl flex flex-col gap-2">
          <div className="flex justify-between items-center">
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
          <div className="w-full break-all overflow-hidden bg-muted text-muted-foreground p-3 rounded-md border border-gray-200 dark:border-gray-700">
            <code className="text-xs">{accessToken.accessToken}</code>
          </div>
          <p className="text-xs text-gray-500 text-center">
            {providerName} {serviceName} connected successfully
          </p>
          <div className="flex justify-center items-center gap-3 text-center m-4">
            <Button
              type="button"
              variant="outline"
              size="default"
              className="w-full sm:flex-1 sm:max-w-[200px] text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive/90 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                onRemoveConfig();
              }}
            >
              Disconnect
            </Button>

            <DrawerClose asChild>
              <Button
                type="button"
                size="default"
                className="w-full sm:flex-1 sm:max-w-[200px] cursor-pointer"
              >
                Close
              </Button>
            </DrawerClose>
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
            className="flex justify-center gap-0 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 shadow-sm w-full sm:max-w-[300px]"
            onClick={async () => {
              try {
                // We know provider is valid at this point due to the isValidProvider check
                await user?.getConnectedAccount(
                  envVar.oauthProvider as ValidProvider,
                  {
                    or: "redirect",
                    scopes: envVar.oauthScopes ?? undefined,
                  },
                );
              } catch (error) {
                toast.error(
                  `Failed to connect to ${providerName} ${serviceName}`,
                );
                console.error(error);
              }
            }}
          >
            <ModuleIcon
              svg={module.svg}
              darkModeColor={module.darkModeColor}
              lightModeColor={module.lightModeColor}
            />
            <span>Connect {providerName}</span>
          </Button>
        </div>
      )}
    </div>
  );
}

function ModuleConfigDrawerView({
  module,
  isConfigLoading,
  configData,
  isSubmitting,
  setIsSubmitting,
  setOpen,
  onConfigSaveAction,
}: {
  module: ModuleWithRequirements;
  isConfigLoading: boolean;
  configData: ModuleConfigVar[];
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setOpen: (isOpen: boolean) => void;
  onConfigSaveAction: (
    moduleId: string,
    configs: Record<string, string>,
  ) => Promise<void>;
}) {
  const formSchema = useMemo(
    () => createFormSchema(module.environmentVariableRequirements),
    [module.environmentVariableRequirements],
  );
  type FormValues = z.infer<typeof formSchema>;

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Get default form values from existing configuration
  const getDefaultValues = useCallback(() => {
    return configData.reduce((acc: Record<string, string>, existingConfig) => {
      acc[existingConfig.environmentVariableId] = existingConfig?.value;

      return acc;
    }, {});
  }, [configData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when external data changes
  useEffect(() => {
    if (configData) {
      reset(getDefaultValues());
    }
  }, [configData, reset, getDefaultValues]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    toast.promise(
      onConfigSaveAction(module.id, data)
        .then(() => {
          setOpen(false);

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

  const handleRemoveConfiguration = () => {
    setConfirmDialogOpen(true);
  };

  const executeConfigurationRemoval = async () => {
    setIsSubmitting(true);

    toast.promise(
      deleteModuleConfiguration(module.id)
        .then(() => {
          setOpen(false);

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

  // Check if this module has any OAuth requirements
  const oauthRequirements = module.environmentVariableRequirements.filter(
    (req) => req.source === "oauth",
  );

  // Check if this module has any text requirements
  const textRequirements = module.environmentVariableRequirements.filter(
    (req) => req.source === "text",
  );

  return (
    <>
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

        {isConfigLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Loading configuration...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
            {/* Render OAuth UI for OAuth requirements */}
            {oauthRequirements.length > 0 && (
              <div className="flex flex-col gap-4 py-6">
                {oauthRequirements.map((req) => (
                  <div key={req.id} className="w-full">
                    <OAuthConfigUI
                      envVar={req}
                      module={module}
                      onRemoveConfig={handleRemoveConfiguration}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Render text input fields for text requirements */}
            {textRequirements.length > 0 && (
              <div className="flex flex-col gap-4 py-6">
                {textRequirements.map((envVar) => (
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
                          {(errors[envVar.id]?.message ?? "Unknown") as string}
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
                      {module.isConfigured ? (
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

            {/* If no requirements are present, show a message */}
            {module.environmentVariableRequirements.length === 0 && (
              <div className="py-4 text-center text-muted-foreground">
                No configuration required for this module.
              </div>
            )}
          </form>
        )}
      </div>

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

export function ModuleConfigDrawer({
  module,
  onConfigSaveAction,
  defaultOpen = false,
  isConfigLoading = false,
  configData,
}: ModuleConfigDrawerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const user = useUser();

  // Handler for drawer open state changes
  const handleOpenChange = (isOpen: boolean) => {
    // If trying to open the drawer and no authenticated user
    if (isOpen && user === null) {
      // Prevent drawer from opening
      setShowAuthPopup(true);
      return;
    }
    // Otherwise, set drawer state normally
    setOpen(isOpen);
  };

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        direction="bottom"
        snapPoints={["content"]}
      >
        <ModuleConfigTrigger
          module={module}
          isConfigLoading={isConfigLoading}
        />
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
          <Suspense
            fallback={
              <div className="h-16 w-full flex flex-row justify-center items-center">
                <Loader2 className="animate-spin" />
              </div>
            }
          >
            <ModuleConfigDrawerView
              module={module}
              isConfigLoading={isConfigLoading}
              configData={configData}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
              setOpen={setOpen}
              onConfigSaveAction={onConfigSaveAction}
            />
          </Suspense>
        </DrawerContent>
      </Drawer>

      {/* Auth Popup for anonymous users */}
      {showAuthPopup && (
        <div className="z-50">
          <AuthPopup
            isOpen={showAuthPopup}
            onClose={() => setShowAuthPopup(false)}
            title="Sign in Required"
            message="You need to sign in to configure modules"
            ctaText="Sign In"
            allowClose={true}
          />
        </div>
      )}
    </>
  );
}
