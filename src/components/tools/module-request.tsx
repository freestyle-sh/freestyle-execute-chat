"use client";

import type { ToolInvocation } from "ai";
import { Puzzle } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/tool-output";
import { useCurrentChat } from "../chat";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "@/components/module-icon";
import { listModules } from "@/actions/modules/list-modules";
import { useModulesStore } from "@/stores/modules";
import { getModuleConfiguration } from "@/actions/modules/get-config";
import { getAllModuleConfigurations } from "@/actions/modules/get-all-configs";
import { configureModules } from "@/components/utility/dialogs/store";

export type ModuleRequestProps = {
  request: ToolInvocation & {
    args: {
      moduleId: string;
      reason: string;
    };
  };
  className?: string;
};

export function ModuleRequest({ request, className }: ModuleRequestProps) {
  const { addToolResult } = useCurrentChat();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "denied">(
    "pending",
  );
  const { chatId } = useCurrentChat();
  const toggleModule = useModulesStore((state) => state.toggleModule);

  // Fetch module information
  const { data: modules, isLoading: isModulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

  const module = modules?.find((m) => m.id === request.args.moduleId);

  const requestMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);

      if (module === undefined) {
        throw new Error("Module not found");
      }

      // If configured, enable the module and return
      if (module?.isConfigured) {
        // Toggle module in store
        toggleModule(request.args.moduleId, true);

        return {
          status: "approved",
          message: "Module enabled successfully",
          moduleId: request.args.moduleId,
        };
      }

      // Not configured, open configuration dialog
      const configured = await configureModules([module]);

      // Configuration was cancelled
      if (!configured) {
        throw new Error("Module configuration was cancelled");
      }

      // Toggle module in store after configuration
      toggleModule(request.args.moduleId, true);

      return {
        status: "approved",
        message: "Module configured and enabled successfully",
        moduleId: request.args.moduleId,
      };
    },
    onSuccess: (data) => {
      setStatus("approved");
      queryClient.invalidateQueries({ queryKey: ["chat-modules"] });

      const toolCallId = request.toolCallId;
      addToolResult({
        toolCallId,
        result: JSON.stringify(data),
      });

      toast.success(`${module?.name || "Module"} enabled successfully`);
    },
    onError: (error) => {
      console.error("Error handling module request:", error);
      toast.error("Failed to enable module");

      // Only set to denied if the error wasn't from cancellation
      if (error.message !== "Module configuration was cancelled") {
        setStatus("denied");
      }
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  // Handle denial
  const handleDeny = () => {
    setIsDenying(true);

    try {
      setStatus("denied");
      const toolCallId = request.toolCallId;

      addToolResult({
        toolCallId,
        result: JSON.stringify({
          status: "denied",
          message: "Module access request was denied",
          moduleId: request.args.moduleId,
        }),
      });

      toast.info(`${module?.name || "Module"} access denied`);
    } catch (error) {
      console.error("Error denying module access:", error);
      toast.error("Failed to process denial");
    } finally {
      setIsDenying(false);
    }
  };

  // Render module request UI
  const renderRequestContent = () => {
    if (status === "approved") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {module && (
              <ModuleIcon
                svg={module.svg}
                lightModeColor={module.lightModeColor}
                darkModeColor={module.darkModeColor}
                size="md"
              />
            )}
            <div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                Module enabled
              </div>
              <div className="text-xs text-muted-foreground">
                {module?.name || request.args.moduleId} is now available for
                this chat
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === "denied") {
      return (
        <div className="text-sm text-muted-foreground italic">
          Module access request was denied.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {module ? (
            <ModuleIcon
              svg={module.svg}
              lightModeColor={module.lightModeColor}
              darkModeColor={module.darkModeColor}
              size="md"
            />
          ) : (
            <Puzzle className="h-8 w-8 text-primary" />
          )}

          <div>
            <h3 className="font-medium">
              {module?.name || "Module"} Access Request
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {request.args.reason}
            </p>

            {(module?.environmentVariableRequirements?.length ?? 0) > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Required Configuration:
                </p>
                <div className="mt-1 flex gap-1.5 flex-wrap">
                  {module?.environmentVariableRequirements?.map((req) => (
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
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            onClick={handleDeny}
            disabled={isProcessing || isDenying}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {isDenying ? "Denying..." : "Deny"}
          </Button>
          <Button
            onClick={() => requestMutation.mutate()}
            disabled={isProcessing || isDenying}
          >
            {isProcessing ? "Processing..." : "Enable"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ToolOutput
      title={`Module Request: ${module?.name || request.args.moduleId}`}
      icon={Puzzle}
      badge={<ToolOutputBadge variant="info">Module Request</ToolOutputBadge>}
      content={renderRequestContent()}
      className={className}
    />
  );
}

