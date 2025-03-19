import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siStripe } from "simple-icons";
export default async function initStripe() {
  const stripe = await db
    .insert(freestyleModulesTable)
    .values({
      name: "stripe",
      svg: siStripe.svg,
      lightModeColor: siStripe.hex,
      darkModeColor: siStripe.hex,
      nodeModules: {
        stripe: "17.7.0",
      },
      example: `Interact with your Stripe account`,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: stripe[0].id,
      name: "STRIPE_KEY",
      description: "Stripe key",
      example: "sk_test_5165vg64hjgvjhvf324ahvjhvhgvghvhgvhgvhgv",
    },
  ]);
  return stripe;
}
