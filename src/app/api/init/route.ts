import { db } from "@/db";
import { freestyleModulesTable } from "@/db/schema";
import { siResend } from "simple-icons";

export async function POST() {
  await db.delete(freestyleModulesTable);
  db.insert(freestyleModulesTable).values({
    name: "resend",
    svg: siResend.svg,
    color: siResend.hex,
    documentation: "",
    example: "",
  });
}
