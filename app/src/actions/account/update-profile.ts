"use server";

import { auth } from "../auth";

export async function toggleMfa(enabled: boolean) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  user.update({
    otpAuthEnabled: enabled,
  });
}

export async function getMfaStatus() {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  return {
    isMfaEnabled: user.otpAuthEnabled,
  };
}

export async function updateProfileName(name: string) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  if (name.trim() === "") {
    throw new Error("Name cannot be empty");
  }

  await user.update({
    displayName: name,
  });
}

export async function updateAvatar(avatarUrl: string) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  await user.update({
    profileImageUrl: avatarUrl,
  });
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  await user.updatePassword({
    oldPassword: currentPassword,
    newPassword: newPassword,
  });
}

export async function makeEmailPrimary(email: string) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  const contacts = await user.listContactChannels();

  const contactToMakePrimary = contacts.find(
    (contact) => contact.type === "email" && contact.value === email,
  );
  if (!contactToMakePrimary) {
    throw new Error("Email not found");
  }

  if (!contactToMakePrimary.isVerified) {
    throw new Error("Email is not verified");
  }

  await user.setPrimaryEmail(email, {
    verified: true,
  });
}

export async function addEmail(email: string) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  await user.createContactChannel({
    type: "email",
    value: email,
    usedForAuth: false,
  });
}

export async function removeEmail(email: string) {
  const user = await auth();

  if (!user) {
    throw new Error("User not found");
  }

  const contacts = await user.listContactChannels();
  const contactToRemove = contacts.find(
    (contact) => contact.type === "email" && contact.value === email,
  );

  if (contactToRemove) {
    await contactToRemove.delete();
  } else {
    throw new Error("Email not found");
  }
}
