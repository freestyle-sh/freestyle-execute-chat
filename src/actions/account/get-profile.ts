"use server";

import { stackServerApp } from "@/stack";

export async function getUserProfile() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return null;
  }
  const contacts = await user.listContactChannels();

  return {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    profileImageUrl: user.profileImageUrl,
    emails: contacts
      .filter((contact) => contact.type === "email")
      .map((contact) => contact.value),
  };
}

export async function getUserEmails() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return null;
  }
  const contacts = await user.listContactChannels();

  return contacts
    .filter((contact) => contact.type === "email")
    .map((contact) => ({
      email: contact.value,
      isVerified: contact.isVerified || false,
      isPrimary: contact.value === user.primaryEmail,
    }));
}
