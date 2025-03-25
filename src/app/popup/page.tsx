"use client";

import { useState } from "react";
import { AuthPopup } from "@/components/ui/auth-popup";
import { Button } from "@/components/ui/button";
import BlinkingLogoComponent from "@/components/blinking-logo";

export default function PopupPage() {
  // Standard popup state
  const [isOpen, setIsOpen] = useState(false);
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [message, setMessage] = useState(
    "To send more messages please sign in"
  );
  const [title, setTitle] = useState("Authentication Required");
  const [ctaText, setCtaText] = useState("Sign In");
  const [allowClose, setAllowClose] = useState(true);

  const messageOptions = [
    "To send more messages please sign in",
    "To enable this module please sign in",
    "To access this feature please sign in",
    "To continue your conversation please sign in",
  ];

  const titleOptions = [
    "Authentication Required",
    "Sign in Required",
    "Account Required",
    "Freestyle Account Needed",
  ];

  const ctaOptions = [
    "Sign In",
    "Create Account",
    "Continue to Sign In",
    "Get Started",
  ];

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gradient-to-b from-background to-secondary/10">
      <div className="mb-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <BlinkingLogoComponent size={28} className="text-primary" />
          <h1 className="text-2xl font-bold">Auth Popup Demo</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Customizable, inviting authentication popup
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
        {/* Left panel - Popup customizations */}
        <div className="bg-card rounded-xl border shadow-sm p-6 animate-slide-up">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b">
            Customize Popup
          </h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Message:</label>
              <div className="grid grid-cols-1 gap-2">
                {messageOptions.map((opt) => (
                  <Button
                    key={opt}
                    variant={message === opt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMessage(opt)}
                    className="justify-start h-auto py-2 text-left text-xs"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title:</label>
              <div className="grid grid-cols-2 gap-2">
                {titleOptions.map((opt) => (
                  <Button
                    key={opt}
                    variant={title === opt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTitle(opt)}
                    className="h-auto py-2"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CTA Button:</label>
              <div className="grid grid-cols-2 gap-2">
                {ctaOptions.map((opt) => (
                  <Button
                    key={opt}
                    variant={ctaText === opt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCtaText(opt)}
                    className="h-auto py-2"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!allowClose}
                  onChange={() => setAllowClose(!allowClose)}
                  className="rounded"
                />
                <span className="text-sm font-medium">
                  Force Authentication (non-closable)
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-5">
                When enabled, the popup cannot be dismissed and the "Continue as
                Guest" button is hidden
              </p>
            </div>
          </div>
        </div>

        {/* Right panel - Demo buttons */}
        <div className="bg-card rounded-xl border shadow-sm p-6 animate-slide-up flex flex-col">
          <h2 className="text-lg font-medium mb-4 pb-2 border-b">
            Demo Options
          </h2>

          <div className="flex flex-col gap-4 flex-1">
            <div className="rounded-lg bg-muted/30 p-4">
              <h3 className="text-sm font-medium mb-2">Standard Popup</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Shows a popup that can be closed with the "X" button, by
                pressing Escape, by clicking outside, or by using the "Continue
                as Guest" button.
              </p>

              <Button
                onClick={() => {
                  setAllowClose(true);
                  setIsOpen(true);
                }}
                className="w-full py-4"
              >
                Show Standard Popup
              </Button>
            </div>

            <div className="rounded-lg bg-muted/30 p-4">
              <h3 className="text-sm font-medium mb-2">
                Forced Authentication
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Shows a popup that cannot be closed except by clicking the
                primary action button. No escape key, no clicking outside, no
                close button.
              </p>

              <Button
                onClick={() => {
                  setAllowClose(false);
                  setIsLockOpen(true);
                }}
                variant="secondary"
                className="w-full py-4"
              >
                Show Forced Auth Popup
              </Button>
            </div>

            <div className="mt-auto pt-4 text-xs text-muted-foreground">
              <p>
                The forced authentication popup is what will appear when a user
                has reached their message limit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Standard popup */}
      <AuthPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message={message}
        title={title}
        ctaText={ctaText}
        allowClose={true}
        onAction={() => setIsOpen(false)}
      />

      {/* Force auth popup */}
      <AuthPopup
        isOpen={isLockOpen}
        onClose={() => setIsLockOpen(false)}
        message={message}
        title={title}
        ctaText={ctaText}
        allowClose={false}
        onAction={() => setIsLockOpen(false)}
      />
    </div>
  );
}
