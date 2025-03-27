"use client";

import type { ToolInvocation } from "ai";
import { Puzzle } from "lucide-react";
import { ToolOutput, ToolOutputBadge } from "@/components/tool-output";
import { useCurrentChat } from "../chat";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ModuleIcon } from "@/components/module-icon";
import {
  getOrCreateModuleRequest,
  getModuleRequest,
  updateModuleRequest,
} from "@/actions/modules/request-module";
import { listModules } from "@/actions/modules/list-modules";
import { useModulesStore } from "@/stores/modules";
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
  const { addToolResult, chatId } = useCurrentChat();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "denied">(
    "pending",
  );
  const toggleModule = useModulesStore((state) => state.toggleModule);
  const toolCallId = request.toolCallId;

  // ChatId is guaranteed to be defined through the context

  // Fetch module information
  const { data: modules, isLoading: isModulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

  const module = modules?.find((m) => m.id === request.args.moduleId);

  // Fetch module request state
  const { data: moduleRequest, isLoading: isModuleRequestLoading } = useQuery({
    queryKey: ["moduleRequest", toolCallId],
    queryFn: async () => {
      // First, make sure a request exists in the database
      await getOrCreateModuleRequest({
        chatId,
        moduleId: request.args.moduleId,
        toolCallId,
        reason: request.args.reason,
      });

      // Then fetch the latest status
      return getModuleRequest(toolCallId);
    },
    refetchOnWindowFocus: false,
  });

  // Set initial status based on the server state
  useEffect(() => {
    if (moduleRequest) {
      setStatus(moduleRequest.state);

      // If already approved, update the local store
      if (moduleRequest.state === "approved") {
        toggleModule(moduleRequest.moduleId, true);
      }
    }
  }, [moduleRequest, toggleModule]);

  // Handle module request
  const requestMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);

      if (!moduleRequest) {
        throw new Error("Module request not found");
      }

      // If configured, enable the module and return
      if (module?.isConfigured) {
        // Update request state in database
        const result = await updateModuleRequest(moduleRequest.id, {
          state: "approved",
        });

        // Toggle module in store
        toggleModule(request.args.moduleId, true);

        // Return successful result
        return {
          status: "approved",
          message: "Module enabled successfully",
          moduleId: request.args.moduleId,
        };
      }

      // Not configured, open configuration dialog
      if (module) {
        const configured = await configureModules([module]);

        if (configured) {
          // Update request state in database
          const result = await updateModuleRequest(moduleRequest.id, {
            state: "approved",
          });

          // Toggle module in store after configuration
          toggleModule(request.args.moduleId, true);

          return {
            status: "approved",
            message: "Module configured and enabled successfully",
            moduleId: request.args.moduleId,
          };
        }

        // Configuration was cancelled
        throw new Error("Module configuration was cancelled");
      }
      throw new Error("Module not found");
    },
    onSuccess: (data) => {
      setStatus("approved");
      queryClient.invalidateQueries({ queryKey: ["chat-modules"] });
      queryClient.invalidateQueries({
        queryKey: ["moduleRequest", toolCallId],
      });

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
  const denyMutation = useMutation({
    mutationFn: async () => {
      setIsDenying(true);

      if (!moduleRequest) {
        throw new Error("Module request not found");
      }

      const result = await updateModuleRequest(moduleRequest.id, {
        state: "denied",
      });

      return result;
    },
    onSuccess: () => {
      setStatus("denied");
      queryClient.invalidateQueries({
        queryKey: ["moduleRequest", toolCallId],
      });

      addToolResult({
        toolCallId,
        result: JSON.stringify({
          status: "denied",
          message: "Module access request was denied",
          moduleId: request.args.moduleId,
        }),
      });

      toast.info(`${module?.name || "Module"} access denied`);
    },
    onError: (error) => {
      console.error("Error denying module access:", error);
      toast.error("Failed to process denial");
    },
    onSettled: () => {
      setIsDenying(false);
    },
  });

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
            onClick={() => denyMutation.mutate()}
            disabled={isProcessing || isDenying || isModuleRequestLoading}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {isDenying ? "Denying..." : "Deny"}
          </Button>
          <Button
            onClick={() => requestMutation.mutate()}
            disabled={isProcessing || isDenying || isModuleRequestLoading}
          >
            {isProcessing ? "Processing..." : "Enable"}
          </Button>
        </div>
      </div>
    );
  };

  if (isModuleRequestLoading) {
    return (
      <ToolOutput
        title={`Module Request: ${module?.name || request.args.moduleId}`}
        icon={Puzzle}
        badge={<ToolOutputBadge variant="info">Module Request</ToolOutputBadge>}
        content={
          <div className="flex items-center justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading...
            </span>
          </div>
        }
        className={className}
      />
    );
  }

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

