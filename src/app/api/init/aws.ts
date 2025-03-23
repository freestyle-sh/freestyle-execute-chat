import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siAmazonwebservices } from "simple-icons";
export default async function initAWS() {
  const aws = await db
    .insert(freestyleModulesTable)
    .values({
      name: "AWS",
      id: "aws",
      svg: siAmazonwebservices.svg,
      lightModeColor: siAmazonwebservices.hex,
      darkModeColor: "FF9900",
      nodeModules: {
        "aws-sdk": "2.1037.0",
      },
      example: `Interact with the AWS SDK`,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: aws[0].id,
    name: "AWS_ACCESS_KEY_ID",
    description: "AWS Access Key ID",
    example: "your-aws-access-key-id",
  });

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: aws[0].id,
    name: "AWS_SECRET_ACCESS_KEY",
    description: "AWS Secret Access Key",
    example: "your-aws-secret-access-key",
  });

  return aws;
}
