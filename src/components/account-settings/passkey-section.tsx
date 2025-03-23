// "use client";
//
// import { useState } from "react";
// import { useUser } from "@stackframe/stack";
// import { SettingsSection } from "@/components/settings";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { PlusIcon, TrashIcon, KeyIcon } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import {
//   createPasskey,
//   getUserPasskeys,
//   removePasskey,
// } from "@/actions/account/update-profile";
//
// export interface Passkey {
//   id: string;
//   name: string;
//   createdAt: string;
//   lastUsed: string | null;
// }
//
// function formatDate(dateString: string | null): string {
//   if (!dateString) return "Never";
//
//   const date = new Date(dateString);
//   return new Intl.DateTimeFormat("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   }).format(date);
// }
//
// function EmptyState() {
//   return (
//     <div className="flex flex-col items-center justify-center p-6 text-center">
//       <KeyIcon className="h-12 w-12 text-muted-foreground mb-4" />
//       <h3 className="font-medium mb-2">No passkeys added yet</h3>
//       <p className="text-sm text-muted-foreground mb-4">
//         Passkeys are a more secure alternative to passwords. Add a passkey to
//         sign in more easily.
//       </p>
//     </div>
//   );
// }
//
// function LoadingSkeleton() {
//   return (
//     <div className="animate-pulse space-y-4">
//       <div className="h-10 w-full bg-muted rounded-md" />
//       <div className="h-10 w-full bg-muted rounded-md" />
//     </div>
//   );
// }
//
// export function PasskeySection() {
//   const user = useUser();
//   const queryClient = useQueryClient();
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [newPasskeyName, setNewPasskeyName] = useState("");
//
//   const {
//     data: passkeys = [],
//     isLoading,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["passkeys", { userId: user?.id }],
//     queryFn: getUserPasskeys,
//     enabled: !!user?.id,
//   });
//
//   const createPasskeyMutation = useMutation({
//     mutationFn: createPasskey,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["passkeys"] });
//       setIsAddDialogOpen(false);
//       setNewPasskeyName("");
//     },
//     onError: (error) => {
//       console.error("Failed to create passkey:", error);
//       toast.error("Failed to create passkey. Please try again.");
//     },
//   });
//
//   const removePasskeyMutation = useMutation({
//     mutationFn: removePasskey,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["passkeys"] });
//     },
//     onError: (error) => {
//       console.error("Failed to remove passkey:", error);
//       toast.error("Failed to remove passkey");
//     },
//   });
//
//   const handleCreatePasskey = () => {
//     if (!newPasskeyName.trim()) {
//       toast.error("Please provide a name for your passkey");
//       return;
//     }
//
//     toast.promise(createPasskeyMutation.mutateAsync(newPasskeyName), {
//       loading: "Creating passkey...",
//       success: "Passkey created successfully!",
//       error: "Failed to create passkey",
//     });
//   };
//
//   const handleRemovePasskey = (passkeyId: string) => {
//     toast.promise(removePasskeyMutation.mutateAsync(passkeyId), {
//       loading: "Removing passkey...",
//       success: "Passkey removed successfully!",
//       error: "Failed to remove passkey",
//     });
//   };
//
//   return (
//     <SettingsSection
//       title="Passkeys"
//       description="Manage your passkeys for passwordless authentication"
//     >
//       <Card className="p-6">
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <p className="font-medium">Passkeys</p>
//             <p className="text-sm text-muted-foreground">
//               Sign in without a password using your device's biometrics or PIN
//             </p>
//           </div>
//           <Button
//             onClick={() => setIsAddDialogOpen(true)}
//             className="cursor-pointer"
//           >
//             <PlusIcon className="mr-2 h-4 w-4" />
//             Add Passkey
//           </Button>
//         </div>
//
//         {isLoading ? (
//           <LoadingSkeleton />
//         ) : error ? (
//           <div className="text-center p-4">
//             <p className="text-destructive">Error loading passkeys</p>
//             <button
//               type="button"
//               className="text-sm text-muted-foreground hover:text-primary mt-2 cursor-pointer"
//               onClick={() => refetch()}
//             >
//               Retry
//             </button>
//           </div>
//         ) : passkeys.length === 0 ? (
//           <EmptyState />
//         ) : (
//           <div className="space-y-4">
//             {passkeys.map((passkey) => (
//               <div
//                 key={passkey.id}
//                 className="flex items-center justify-between py-2"
//               >
//                 <div>
//                   <div className="flex items-center">
//                     <KeyIcon className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <p className="font-medium">{passkey.name}</p>
//                   </div>
//                   <div className="flex text-xs text-muted-foreground mt-1">
//                     <p>Created: {formatDate(passkey.createdAt)}</p>
//                     <span className="mx-2">•</span>
//                     <p>Last used: {formatDate(passkey.lastUsed)}</p>
//                   </div>
//                 </div>
//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   className="h-8 w-8 text-destructive cursor-pointer"
//                   onClick={() => handleRemovePasskey(passkey.id)}
//                   disabled={
//                     removePasskeyMutation.isPending &&
//                     removePasskeyMutation.variables === passkey.id
//                   }
//                 >
//                   {removePasskeyMutation.isPending &&
//                   removePasskeyMutation.variables === passkey.id ? (
//                     <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                   ) : (
//                     <TrashIcon className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>
//
//       {/* Add Passkey Dialog */}
//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Add a Passkey</DialogTitle>
//             <DialogDescription>
//               Create a passkey to sign in securely without a password.
//             </DialogDescription>
//           </DialogHeader>
//
//           <div className="grid gap-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="passkey-name">Passkey name</Label>
//               <Input
//                 id="passkey-name"
//                 placeholder="MacBook Pro Touch ID"
//                 value={newPasskeyName}
//                 onChange={(e) => setNewPasskeyName(e.target.value)}
//                 disabled={createPasskeyMutation.isPending}
//               />
//               <p className="text-xs text-muted-foreground">
//                 Give your passkey a name to help you identify it later.
//               </p>
//             </div>
//           </div>
//
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsAddDialogOpen(false)}
//               disabled={createPasskeyMutation.isPending}
//               className="cursor-pointer"
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleCreatePasskey}
//               disabled={
//                 createPasskeyMutation.isPending || !newPasskeyName.trim()
//               }
//               className="cursor-pointer"
//             >
//               {createPasskeyMutation.isPending ? (
//                 <>
//                   <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
//                   Creating...
//                 </>
//               ) : (
//                 "Create Passkey"
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </SettingsSection>
//   );
// }
//

