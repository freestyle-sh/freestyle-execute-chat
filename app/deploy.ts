// import { }
import { FreestyleSandboxes } from "freestyle-sandboxes";
import { prepareDirForDeploymentSync } from "freestyle-sandboxes/utils";
const freestyleSandboxes = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!,
});

const domains = await freestyleSandboxes.deployWeb(
  prepareDirForDeploymentSync(process.cwd() + "/.next/standalone/app"),
  {
    domains: ["chat.freestyle.sh"],
    envVars: {
      ...(process.env as Record<string, string>),
    },
    entrypoint: "server.js",
    timeout: 180,
  }
);

console.log("Domains: ", domains);
