import { stackServerApp } from "@/stack";
import { cookies } from "next/headers";

export async function getUserId(): Promise<string> {
  const user = await stackServerApp.getUser({ or: "anonymous" });
  return user.id;
}
