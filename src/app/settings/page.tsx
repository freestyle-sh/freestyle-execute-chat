"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsSection, SettingsItem } from "@/components/settings";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4 max-w-2xl">
        <SettingsSection title="Appearance">
          <SettingsItem
            title="Theme"
            description="Choose your preferred theme mode"
          >
            <ThemeToggle />
          </SettingsItem>
        </SettingsSection>

        <SettingsSection
          title="Account"
          description="Manage your account settings"
        />
      </div>
    </div>
  );
}
