"use client";

import { updatePassword } from "@/actions/account/update-profile";
import { SettingsSection } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@stackframe/stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function PasswordSection() {
  const user = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Check if the user has a password set
  const hasPassword = user?.hasPassword ?? false;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formErrors, setFormErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      updatePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFormErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const validateForm = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;

    // Only validate current password if the user has a password set
    if (hasPassword && !currentPassword) {
      errors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!newPassword) {
      errors.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    toast.promise(
      passwordMutation.mutateAsync({
        currentPassword,
        newPassword,
      }),
      {
        loading: hasPassword ? "Updating password..." : "Setting password...",
        success: hasPassword
          ? "Password updated successfully!"
          : "Password set successfully!",
        error: (e) =>
          `Failed to ${hasPassword ? "update" : "set"} password: ${e.message}`,
      },
    );
  };

  return (
    <SettingsSection title="Password" description="Change your password">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Password</p>
            <p className="text-sm text-muted-foreground">
              {hasPassword
                ? "Secure your account with a strong password"
                : "No password set. Set a password to enable password auth."}
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                {hasPassword ? "Change Password" : "Set Password"}
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] flex flex-col gap-8">
              <DialogHeader>
                <DialogTitle>
                  {hasPassword ? "Change Password" : "Set Password"}
                </DialogTitle>
                <DialogDescription>
                  {hasPassword
                    ? "Update your password to keep your account secure."
                    : "Set a password to enable password auth."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="space-y-4">
                  {/* Only show current password field if user has a password set */}
                  {hasPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter your current password"
                          className={
                            formErrors.currentPassword
                              ? "border-destructive"
                              : ""
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOffIcon size={16} />
                          ) : (
                            <EyeIcon size={16} />
                          )}
                        </button>
                      </div>
                      {formErrors.currentPassword && (
                        <p className="text-xs text-destructive">
                          {formErrors.currentPassword}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className={
                          formErrors.newPassword ? "border-destructive" : ""
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOffIcon size={16} />
                        ) : (
                          <EyeIcon size={16} />
                        )}
                      </button>
                    </div>
                    {formErrors.newPassword && (
                      <p className="text-xs text-destructive">
                        {formErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your new password"
                        className={
                          formErrors.confirmPassword ? "border-destructive" : ""
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOffIcon size={16} />
                        ) : (
                          <EyeIcon size={16} />
                        )}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {formErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                    disabled={passwordMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={passwordMutation.isPending}
                  >
                    {passwordMutation.isPending
                      ? hasPassword
                        ? "Updating..."
                        : "Setting..."
                      : hasPassword
                        ? "Update Password"
                        : "Set Password"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </SettingsSection>
  );
}
