"use client";

import * as React from "react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BlinkingLogoComponent from "@/components/blinking-logo";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Custom DialogContent that can optionally hide the close button
const AuthDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
  }
>(({ className, children, hideCloseButton = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-98 data-[state=open]:zoom-in-98 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}

      {/* Only render close button if hideCloseButton is false */}
      {!hideCloseButton && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent">
          <X className="h-4 w-4 dark:text-black text-white" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
AuthDialogContent.displayName = "AuthDialogContent";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  ctaText?: string;
  onAction?: () => void;
  allowClose?: boolean; // New prop to control whether popup can be closed
}

export function AuthPopup({
  isOpen,
  onClose,
  title = "Authentication Required",
  message = "To send more messages please sign in",
  ctaText = "Sign In",
  onAction,
  allowClose = true, // Default to allowing close
}: AuthPopupProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // Only allow closing if allowClose is true
        if (allowClose && !open) {
          onClose();
        }
      }}
    >
      <AuthDialogContent
        className="sm:max-w-md overflow-hidden rounded-xl border-0 shadow-2xl p-0"
        hideCloseButton={!allowClose}
        // Prevent closing by clicking outside when allowClose is false
        onPointerDownOutside={(e: Event) => {
          if (!allowClose) {
            e.preventDefault();
          }
        }}
        // Prevent closing by pressing escape when allowClose is false
        onEscapeKeyDown={(e: Event) => {
          if (!allowClose) {
            e.preventDefault();
          }
        }}
      >
        {/* Logo container with gradient background */}
        <div className="w-full bg-gradient-to-br from-primary/90 to-primary pt-8 pb-10 px-6 flex flex-col items-center">
          <BlinkingLogoComponent
            className="stroke-secondary size-40"
            patternInterval={6000}
          />
          <h2 className="text-xl font-semibold text-white dark:text-black text-center mb-1">
            {title}
          </h2>
          <p className="text-white/80 dark:text-black text-center text-sm">
            {message}
          </p>
        </div>

        {/* Content area */}
        <div className="p-6 pt-5 bg-background">
          <p className="text-sm text-muted-foreground mb-5 text-center">
            Sign in to access all features and continue your conversation
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={onAction || onClose}
              className="w-full py-5 font-medium text-base animate-pulse-subtle cursor-pointer"
            >
              {ctaText}
            </Button>

            {/* Only show "Continue as Guest" button if allowClose is true */}
            {allowClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full bg-transparent hover:bg-secondary/50"
              >
                Continue as Guest
              </Button>
            )}
          </div>
        </div>
      </AuthDialogContent>
    </Dialog>
  );
}
