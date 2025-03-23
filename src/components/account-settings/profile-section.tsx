"use client";

import { SettingsSection } from "@/components/settings";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useState,
  useEffect,
  useRef,
  useOptimistic,
  useTransition,
} from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PencilIcon } from "lucide-react";
import { useUser } from "@stackframe/stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserProfile } from "@/actions/account/get-profile";
import { updateProfileName } from "@/actions/account/update-profile";

function ProfileSkeleton() {
  return (
    <>
      <Skeleton className="w-24 h-24 rounded-full" />
      <div className="flex-1 space-y-4 w-full">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
    </>
  );
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full text-center p-4">
      <p className="text-destructive">Error loading profile data</p>
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

function ProfileAvatar({
  profileImageUrl,
  displayName,
}: {
  profileImageUrl?: string;
  displayName?: string;
}) {
  return (
    <div className="relative">
      <Avatar className="w-24 h-24">
        <AvatarImage
          src={profileImageUrl ?? ""}
          alt={displayName ?? "Anonymous"}
        />
        <AvatarFallback className="text-2xl">
          {(displayName || "A").charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function EditableName({
  displayName,
  primaryEmail,
}: {
  displayName?: string;
  primaryEmail?: string;
}) {
  const actualName = displayName ?? "Anonymous";
  const [inputName, setInputName] = useState(actualName);
  const [isEditing, setIsEditing] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const [_, startTransition] = useTransition();
  const [optimisticName, setOptimisticName] = useOptimistic(
    actualName,
    (_state, newName: string) => newName,
  );

  const resetName = () => setInputName(actualName);

  const nameMutation = useMutation({
    mutationFn: updateProfileName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Failed to update name:", error);
      resetName();
    },
  });

  useEffect(() => {
    // Focus the input when editing starts
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      // Position cursor at the end of the text
      const length = nameInputRef.current.value.length;
      nameInputRef.current.setSelectionRange(length, length);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (inputName.trim() === "") {
      toast.error("Name cannot be empty");
      return;
    }

    if (inputName !== actualName) {
      startTransition(() => setOptimisticName(inputName));

      toast.promise(nameMutation.mutateAsync(inputName), {
        loading: "Updating name...",
        success: "Name updated successfully!",
        error: (err: Error) => `${err.message}`,
      });
    }

    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      resetName();
      setIsEditing(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 w-full">
      <div>
        <div className="relative">
          {isEditing ? (
            <div
              className="bg-transparent relative inline-block w-auto"
              style={{ margin: 0, padding: 0 }}
            >
              <Input
                ref={nameInputRef}
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Your name"
                onKeyDown={handleKeyPress}
                className="!bg-transparent py-0 px-0 m-0 h-auto border-none shadow-none focus-visible:ring-0 focus-visible:outline-none rounded-none w-full"
                style={{
                  minWidth: `${Math.max(inputName.length * 0.8, 8)}ch`,
                  caretColor: "var(--color-primary)",
                  fontSize: "1.25rem",
                  lineHeight: "1.75rem",
                  fontWeight: 500,
                }}
                autoFocus
                onBlur={() => {
                  setIsEditing(false);
                  resetName();
                }}
              />
            </div>
          ) : (
            <div className="group relative inline-flex items-center">
              <h3 className="text-xl leading-7 font-medium">
                {optimisticName}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="ml-1.5 text-muted-foreground hover:text-primary p-1.5 rounded-md hover:bg-muted transition-all"
                aria-label="Edit name"
              >
                <PencilIcon size={14} />
              </button>
            </div>
          )}
        </div>
        <p className="text-muted-foreground mt-1">{primaryEmail}</p>
      </div>
    </div>
  );
}

export function ProfileSection() {
  const user = useUser();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", { userId: user?.id }],
    queryFn: () => getUserProfile(),
    enabled: !!user?.id,
  });

  return (
    <SettingsSection
      title="Profile"
      description="Manage your personal information"
    >
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {isProfileLoading ? (
            <ProfileSkeleton />
          ) : profileError ? (
            <ProfileError
              onRetry={() =>
                queryClient.invalidateQueries({ queryKey: ["profile"] })
              }
            />
          ) : (
            <>
              <ProfileAvatar
                profileImageUrl={profile?.profileImageUrl ?? undefined}
                displayName={profile?.displayName ?? undefined}
              />
              <EditableName
                displayName={profile?.displayName ?? undefined}
                primaryEmail={user?.primaryEmail ?? undefined}
              />
            </>
          )}
        </div>
      </Card>
    </SettingsSection>
  );
}
