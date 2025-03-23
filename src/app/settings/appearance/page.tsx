"use client";

import { SettingsSection, SettingsItem } from "@/components/settings";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppearancePage() {
  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look and feel of Freestyle Chat"
    >
      <SettingsItem
        title="Theme"
        description="Choose your preferred theme mode"
      >
        <ThemeToggle />
      </SettingsItem>
    </SettingsSection>
  );
}
