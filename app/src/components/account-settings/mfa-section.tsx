"use client";

/*
 * NOTE: This is currently broken due to being confusing in stack auth.
 * */

import { SettingsSection } from "@/components/settings";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useOptimistic, useTransition } from "react";
import { useUser } from "@stackframe/stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMfaStatus, toggleMfa } from "@/actions/account/update-profile";

export function MfaSection() {
  const user = useUser();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { data: mfaData, isLoading: isMfaStatusLoading } = useQuery({
    queryKey: ["mfaStatus", { userId: user?.id }],
    queryFn: getMfaStatus,
    enabled: !!user?.id,
  });

  // Set up optimistic state
  const [optimisticMfaEnabled, setOptimisticMfaEnabled] = useOptimistic(
    mfaData?.isMfaEnabled,
    (_, newState: boolean) => newState,
  );

  const toggleMfaMutation = useMutation({
    mutationFn: toggleMfa,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mfaStatus"] });

      toast.success(
        variables
          ? "Two-factor authentication enabled"
          : "Two-factor authentication disabled",
      );
    },
    onError: (error) => {
      console.error("Failed to toggle MFA:", error);
      toast.error("Failed to update two-factor authentication settings");

      // Revert optimistic update on error
      setOptimisticMfaEnabled(mfaData?.isMfaEnabled || false);
    },
  });

  const handleToggleMfa = (enabled: boolean) => {
    if (!user) {
      return;
    }

    // Apply optimistic update
    startTransition(() => {
      setOptimisticMfaEnabled(enabled);
    });

    // Perform the actual mutation
    toggleMfaMutation.mutate(enabled);
  };

  // Use optimistic state instead of actual state
  const mfaEnabled = optimisticMfaEnabled;

  return (
    <SettingsSection
      title="Two-Factor Authentication"
      description="Add an extra layer of security to your account"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">
              {mfaEnabled
                ? "Your account is protected with two-factor authentication"
                : "Protect your account with two-factor authentication"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={optimisticMfaEnabled}
              onCheckedChange={handleToggleMfa}
              disabled={toggleMfaMutation.isPending || isMfaStatusLoading}
              className="cursor-pointer"
            />
            {isMfaStatusLoading || toggleMfaMutation.isPending ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {toggleMfaMutation.isPending ? "Processing..." : "Loading..."}
              </div>
            ) : mfaEnabled ? (
              "Enabled"
            ) : (
              "Disabled"
            )}
          </div>
        </div>
      </Card>
    </SettingsSection>
  );
}
