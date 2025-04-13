"use client";

import { SettingsSection } from "@/components/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card } from "@/components/ui/card";

export default function AppearancePage() {
  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look and feel of Freestyle Chat"
    >
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme mode
            </p>
          </div>
          <ThemeToggle />
        </div>
      </Card>
    </SettingsSection>
  );
}
