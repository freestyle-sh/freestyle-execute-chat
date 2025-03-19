import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { STACKAUTHID } from "@/lib/actions/tempuserid";

const configurationSchema = z.object({
  moduleId: z.string().uuid(),
  configurations: z.array(
    z.object({
      environmentVariableRequirementId: z.string().uuid(),
      value: z.string(),
    }),
  ),
});

async function getTempUserId(): Promise<string> {
  // Use the STACKAUTHID as the userId for now
  return STACKAUTHID;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = await getTempUserId();

    const { moduleId, configurations } = configurationSchema.parse(body);

    // Validate that all environment variable requirements belong to the specified module
    const envVarRequirements = await db
      .select()
      .from(freestyleModulesEnvironmentVariableRequirementsTable)
      .where(
        eq(
          freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
          moduleId,
        ),
      );

    const validEnvVarIds = new Set(envVarRequirements.map((req) => req.id));

    for (const config of configurations) {
      if (!validEnvVarIds.has(config.environmentVariableRequirementId)) {
        return NextResponse.json(
          {
            message: `Invalid environment variable requirement ID: ${config.environmentVariableRequirementId}`,
          },
          { status: 400 },
        );
      }
    }

    // Process each configuration
    const results = await Promise.all(
      configurations.map(async (config) => {
        // Check if there's an existing configuration for this user and env var
        const existingConfig = await db
          .select()
          .from(freestyleModulesConfigurationsTable)
          .where(
            and(
              eq(freestyleModulesConfigurationsTable.userId, userId),
              eq(
                freestyleModulesConfigurationsTable.environmentVariableId,
                config.environmentVariableRequirementId,
              ),
            ),
          )
          .then((rows) => rows[0]);

        if (existingConfig) {
          // Update existing configuration if value is different
          if (existingConfig.value !== config.value) {
            return db
              .update(freestyleModulesConfigurationsTable)
              .set({ value: config.value })
              .where(
                and(
                  eq(freestyleModulesConfigurationsTable.userId, userId),
                  eq(
                    freestyleModulesConfigurationsTable.environmentVariableId,
                    config.environmentVariableRequirementId,
                  ),
                ),
              );
          }
          return { success: true, action: "unchanged" };
        }
        // Insert new configuration
        return db.insert(freestyleModulesConfigurationsTable).values({
          userId,
          environmentVariableId: config.environmentVariableRequirementId,
          value: config.value,
        });
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error handling module request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request data", errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to process module request" },
      { status: 500 },
    );
  }
}
