import fs from "fs";

function extractAPIDocs(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf8");

  // Regex pattern to match API documentation blocks
  const regex =
    /## (.*?)\n\n(.*?)\n\n### Example Usage\n\n```typescript\n([\s\S]*?)```/g;

  let match;
  let extractedDocs = "";

  while ((match = regex.exec(content)) !== null) {
    const apiName = match[1];
    const apiDescription = match[2];
    const exampleCode = match[3];

    extractedDocs += `## ${apiName}\n\n${apiDescription}\n\n### Example Usage\n\n\`\`\`typescript\n${exampleCode}\n\`\`\`\n\n`;
  }

  return extractedDocs;
}

// Example usage:
const filePath = "vercel-docs.txt"; // Replace with your actual file path
const result = extractAPIDocs(filePath);

const outputPath = "vercel-api-docs.md"; // Replace with your desired output path
// Convert to JSON-safe string
const jsonSafeString = JSON.stringify(result);

// Write the markdown output
fs.writeFileSync(outputPath, result);

// Write as TypeScript file with exported string
const tsContent = `// Auto-generated Vercel API documentation
export const vercelDocs = ${jsonSafeString};
`;
fs.writeFileSync("vercel-processed-docs.ts", tsContent);

console.log(
  "Files generated successfully: vercel-api-docs.md and vercel-processed-docs.ts"
);
