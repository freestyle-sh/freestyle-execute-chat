"use client";

import { deleteAccount } from "@/actions/account/delete-account";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function DangerZone() {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== "delete my account") {
      toast.error("Please type the confirmation phrase exactly as shown");
      return;
    }

    setIsDeleting(true);
    
    try {
      await deleteAccount();
      setIsDialogOpen(false);
      toast.success("Account deleted successfully");
      router.replace("/");
    } catch (error) {
      toast.error(error instanceof Error 
        ? `Could not delete account: ${error.message}` 
        : "Could not delete account");
      setIsDeleting(false);
    }
  };

  return (
    <SettingsSection
      title="Danger Zone"
      description="Permanent actions related to your account"
    >
      <Card className="p-6 border-destructive/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all of your data
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="cursor-pointer">Delete Account</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </DialogDescription>
              </DialogHeader>
              
              <div className="my-6">
                <p className="text-sm mb-4">
                  To confirm, type <span className="font-bold">delete my account</span> below:
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="delete my account"
                  className="w-full"
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setConfirmText("");
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== "delete my account" || isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete My Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </SettingsSection>
  );
}

