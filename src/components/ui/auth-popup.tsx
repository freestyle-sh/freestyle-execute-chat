"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BlinkingLogoComponent from "@/components/blinking-logo";

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  ctaText?: string;
  onAction?: () => void;
}

export function AuthPopup({
  isOpen,
  onClose,
  title = "Authentication Required",
  message = "To send more messages please sign in",
  ctaText = "Sign In",
  onAction,
}: AuthPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md overflow-hidden rounded-xl border-0 shadow-2xl p-0">
        {/* Logo container with gradient background */}
        <div className="w-full bg-gradient-to-br from-primary/90 to-primary pt-8 pb-10 px-6 flex flex-col items-center">
          <BlinkingLogoComponent
            className="stroke-secondary size-40"
            patternInterval={6000}
          />
          <h2 className="text-xl font-semibold text-white text-center mb-1">
            {title}
          </h2>
          <p className="text-white/80 text-center text-sm">{message}</p>
        </div>

        {/* Content area */}
        <div className="p-6 pt-5 bg-background">
          <p className="text-sm text-muted-foreground mb-5 text-center">
            Sign in to access all features and continue your conversation
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button
              onClick={onAction || onClose}
              className="w-full py-5 font-medium text-base animate-pulse-subtle"
            >
              {ctaText}
            </Button>

            <Button
              variant="outline"
              onClick={onClose}
              className="w-full bg-transparent hover:bg-secondary/50"
            >
              Continue as Guest
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
