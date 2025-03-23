"use client";

import { ProfileSection } from "./profile-section";
import { EmailSection } from "./email-section";
import { PasswordSection } from "./password-section";
import { DangerZone } from "./danger-zone";

export function AccountSettings() {
  return (
    <div>
      <ProfileSection />
      <EmailSection />
      <PasswordSection />
      <DangerZone />
    </div>
  );
}
