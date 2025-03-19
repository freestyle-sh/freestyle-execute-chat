import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siGithub } from "simple-icons";
import { githubdocs } from "./github-docs";

export default async function initGithub() {
  const github = await db
    .insert(freestyleModulesTable)
    .values({
      name: "github",
      svg: siGithub.svg,
      lightModeColor: siGithub.hex,
      darkModeColor: "ffffff",
      nodeModules: {
        octokit: "4.1.0",
      },
      documentation: githubdocs,
      example:
        "Access GitHub repositories programmatically to create issues, make pull requests, read file contents, and automate your development workflow.",
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values([
    {
      moduleId: github[0].id,
      name: "GITHUB_TOKEN",
      description: "GitHub token",
      example: "github_pat_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    },
  ]);
  return github;
}
