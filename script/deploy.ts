import { FreestyleSandboxes } from "freestyle-sandboxes";
import { prepareDirForDeploymentSync } from "freestyle-sandboxes/utils";

const sandboxes = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_IT_API_KEY!,
  baseUrl: "https://api.freestyle.it.com",
});

const dir = prepareDirForDeploymentSync(".next/standalone/");

const domains = ["chat.freestyle.it.com"];

await sandboxes.deployWeb(dir, {
  entrypoint: "entry.js",
  envVars: {
    DATABASE_URL: process.env.DATABASE_URL!,
    FREESTYLE_API_KEY: process.env.FREESTYLE_API_KEY!,
    STRIPE_KEY: process.env.STRIPE_KEY!,
    NEXT_PUBLIC_STACK_PROJECT_ID: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
    NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:
      process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
    STACK_SECRET_SERVER_KEY: process.env.STACK_SECRET_SERVER_KEY!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
  },
  domains: domains,
});

console.log("Deployed to", domains);
