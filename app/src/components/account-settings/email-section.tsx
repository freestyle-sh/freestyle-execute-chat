"use client";

import { SettingsSection } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  PlusIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useUser } from "@stackframe/stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserEmails } from "@/actions/account/get-profile";
import {
  addEmail,
  makeEmailPrimary,
  removeEmail,
} from "@/actions/account/update-profile";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-3/4 bg-muted rounded-md" />
      <div className="h-8 w-1/2 bg-muted rounded-md" />
      <div className="h-10 w-full bg-muted rounded-md" />
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center p-4">
      <p className="text-destructive">Error loading email information</p>
      <button
        type="button"
        className="text-sm text-muted-foreground hover:text-primary mt-2"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  );
}

function VerificationStatus({ isVerified }: { isVerified: boolean }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="ml-2">
            {isVerified ? (
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircleIcon className="h-4 w-4 text-amber-500" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isVerified
            ? "Email verified"
            : "Email not verified. Check your inbox for verification link."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function EmailSection() {
  const user = useUser();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");

  // Fetch user emails
  const {
    data: emails = [],
    isLoading: isEmailsLoading,
    error: emailsError,
    refetch: refetchEmails,
  } = useQuery({
    queryKey: ["userEmails", { userId: user?.id }],
    queryFn: async () => {
      const result = await getUserEmails();
      return result ?? [];
    },
    enabled: !!user?.id,
  });

  const addEmailMutation = useMutation({
    mutationFn: (email: string) => addEmail(email),
    onSuccess: () => {
      setNewEmail("");
      queryClient.invalidateQueries({ queryKey: ["userEmails"] });
    },
  });

  const removeEmailMutation = useMutation({
    mutationFn: (email: string) => removeEmail(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userEmails"] });
    },
  });

  const makeEmailPrimaryMutation = useMutation({
    mutationFn: async (newPrimaryEmail: string) => {
      await makeEmailPrimary(newPrimaryEmail);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userEmails"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: async (email: string) => {
      const contacts = await user?.listContactChannels();
      const contactToResend = contacts?.find(
        (contact) => contact.type === "email" && contact.value === email,
      );

      if (!contactToResend) {
        throw new Error("Email not found");
      }

      await contactToResend.sendVerificationEmail();
    },
  });

  const handleAddEmail = () => {
    if (!user) {
      return;
    }

    if (newEmail && !emails.some((e) => e.email === newEmail)) {
      toast.promise(addEmailMutation.mutateAsync(newEmail), {
        loading: "Adding email...",
        success: "Email added successfully! Verification email sent.",
        error: (e: Error) => `Failed to add email: ${e.message}`,
      });
    } else if (emails.some((e) => e.email === newEmail)) {
      toast.error("This email is already associated with your account");
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    if (!user || emails.find((e) => e.email === emailToRemove)?.isPrimary) {
      return;
    }

    toast.promise(removeEmailMutation.mutateAsync(emailToRemove), {
      loading: "Removing email...",
      success: "Email removed successfully!",
      error: (e) => `Failed to remove email: ${e.message}`,
    });
  };

  const handleMakePrimary = (newPrimaryEmail: string) => {
    if (!user || emails.find((e) => e.email === newPrimaryEmail)?.isPrimary) {
      return;
    }

    toast.promise(makeEmailPrimaryMutation.mutateAsync(newPrimaryEmail), {
      loading: "Setting as primary...",
      success: "Email set as primary!",
      error: (e: Error) => `Failed to set as primary email: ${e.message}`,
    });
  };

  const handleResendVerification = (email: string) => {
    if (!user) {
      return;
    }

    toast.promise(resendVerificationMutation.mutateAsync(email), {
      loading: "Sending verification email...",
      success: "Verification email sent!",
      error: (e: Error) => `Failed to send verification email: ${e.message}`,
    });
  };

  if (isEmailsLoading) {
    return (
      <SettingsSection
        title="Email Addresses"
        description="Manage your email addresses"
      >
        <Card className="p-6">
          <LoadingSkeleton />
        </Card>
      </SettingsSection>
    );
  }

  if (emailsError) {
    return (
      <SettingsSection
        title="Email Addresses"
        description="Manage your email addresses"
      >
        <Card className="p-6">
          <ErrorState onRetry={() => refetchEmails()} />
        </Card>
      </SettingsSection>
    );
  }

  const primaryEmail = emails.find((e) => e.isPrimary) || {
    email: user?.primaryEmail || "Unknown",
    isVerified: false,
    isPrimary: true,
  };
  const secondaryEmails = emails.filter((e) => !e.isPrimary);

  return (
    <SettingsSection
      title="Email Addresses"
      description="Manage your email addresses"
    >
      <Card className="p-6 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="font-medium">{primaryEmail.email}</p>
              <VerificationStatus isVerified={primaryEmail.isVerified} />
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              Primary email
            </span>
          </div>
          <Separator />
        </div>

        {secondaryEmails.map((emailData, index) => (
          <div key={`${emailData.email}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p>{emailData.email}</p>
                <VerificationStatus isVerified={emailData.isVerified} />
              </div>
              <div className="flex items-center gap-2">
                {!emailData.isVerified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs cursor-pointer"
                    onClick={() => handleResendVerification(emailData.email)}
                    disabled={
                      resendVerificationMutation.isPending &&
                      resendVerificationMutation.variables === emailData.email
                    }
                  >
                    {resendVerificationMutation.isPending &&
                    resendVerificationMutation.variables === emailData.email
                      ? "Sending..."
                      : "Resend Verification"}
                  </Button>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs cursor-pointer"
                          onClick={() => handleMakePrimary(emailData.email)}
                          disabled={
                            makeEmailPrimaryMutation.isPending ||
                            !emailData.isVerified
                          }
                        >
                          {makeEmailPrimaryMutation.isPending &&
                          makeEmailPrimaryMutation.variables === emailData.email
                            ? "Setting..."
                            : "Make Primary"}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!emailData.isVerified && (
                      <TooltipContent side="top">
                        Email must be verified before making it primary
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive cursor-pointer"
                  onClick={() => handleRemoveEmail(emailData.email)}
                  disabled={
                    removeEmailMutation.isPending &&
                    removeEmailMutation.variables === emailData.email
                  }
                >
                  {removeEmailMutation.isPending &&
                  removeEmailMutation.variables === emailData.email ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <Separator />
          </div>
        ))}

        {/* Add New Email */}
        <div className="pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add another email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              disabled={addEmailMutation.isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newEmail) {
                  handleAddEmail();
                }
              }}
            />
            <Button
              onClick={handleAddEmail}
              disabled={addEmailMutation.isPending || !newEmail}
              className="cursor-pointer"
            >
              {addEmailMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            We&apos;ll send a verification email before adding this to your
            account
          </p>
        </div>
      </Card>
    </SettingsSection>
  );
}
