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
import { requestModuleAccess } from "@/actions/modules/request-module";
import { listModules } from "@/actions/modules/list-modules";

export type ModuleRequestProps = {
  request: ToolInvocation & {
    args: {
      moduleId: string;
      reason: string;
      configValues?: Record<string, string>;
    };
  };
  className?: string;
};

export function ModuleRequest({ request, className }: ModuleRequestProps) {
  const { addToolResult } = useCurrentChat();
  const queryClient = useQueryClient();
  const [isApproving, setIsApproving] = useState(false);
  const [isDenying, setIsDenying] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "denied">(
    "pending",
  );
  const { chatId } = useCurrentChat();

  // Fetch module information
  const { data: modules, isLoading: isModulesLoading } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

  const module = modules?.find((m) => m.id === request.args.moduleId);

  // Handle module access request
  const requestMutation = useMutation({
    mutationFn: async () => {
      setIsApproving(true);
      const result = await requestModuleAccess({
        chatId,
        moduleId: request.args.moduleId,
        reason: request.args.reason,
        configValues: request.args.configValues,
      });

      return result;
    },
    onSuccess: (data) => {
      setStatus("approved");
      queryClient.invalidateQueries({ queryKey: ["chat-modules"] });

      const toolCallId = request.toolCallId;
      addToolResult({
        toolCallId,
        result: JSON.stringify({
          status: "approved",
          message: "Module access granted successfully",
          moduleId: request.args.moduleId,
        }),
      });

      toast.success(`${module?.name || "Module"} access granted`);
    },
    onError: (error) => {
      console.error("Error approving module access:", error);
      toast.error("Failed to grant module access");
    },
    onSettled: () => {
      setIsApproving(false);
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
                Module access granted
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
            disabled={isApproving || isDenying}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            {isDenying ? "Denying..." : "Deny"}
          </Button>
          <Button
            onClick={() => requestMutation.mutate()}
            disabled={isApproving || isDenying}
          >
            {isApproving ? "Approving..." : "Approve"}
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

