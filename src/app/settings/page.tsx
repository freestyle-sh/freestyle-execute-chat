"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { SettingsSection, SettingsItem } from "@/components/settings";
import { ModulesSettings } from "@/components/modules-settings";

export default function SettingsPage() {
  return (
    <div className="p-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 gradient-text">Settings</h1>
      <div className="space-y-6 max-w-3xl animate-slide-up">
        <SettingsSection title="Appearance">
          <SettingsItem
            title="Theme"
            description="Choose your preferred theme mode"
          >
            <ThemeToggle />
          </SettingsItem>
        </SettingsSection>

        <ModulesSettings />

        <SettingsSection
          title="Account"
          description="Manage your account settings"
        />
      </div>
    </div>
  );
}
