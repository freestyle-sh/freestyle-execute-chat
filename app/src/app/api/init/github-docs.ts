export const githubdocs = `
Example of getting private repos from a user:

import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export default async () => {
  const username = "...";
  const repos = await octokit.request('GET /users/{username}/repos', {
    username,
    type: 'private',
    per_page: 100
  });

  ...
}
`;
