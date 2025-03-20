import { type NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import {
  freestyleModulesConfigurationsTable,
  freestyleModulesEnvironmentVariableRequirementsTable,
} from "@/db/schema";
import { STACKAUTHID } from "@/lib/actions/tempuserid";

// Get configurations for a specific module
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> },
) {
  try {
    const { moduleId } = await params;

    // Use a placeholder user ID for now
    const userId = STACKAUTHID;

    // Get all environment variable requirements for this module
    const requirements = await db
      .select()
      .from(freestyleModulesEnvironmentVariableRequirementsTable)
      .where(
        eq(
          freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
          moduleId,
        ),
      );

    // Get existing configurations for this module and user
    const configurations = await db
      .select()
      .from(freestyleModulesConfigurationsTable)
      .innerJoin(
        freestyleModulesEnvironmentVariableRequirementsTable,
        eq(
          freestyleModulesConfigurationsTable.environmentVariableId,
          freestyleModulesEnvironmentVariableRequirementsTable.id,
        ),
      )
      .where(
        and(
          eq(
            freestyleModulesEnvironmentVariableRequirementsTable.moduleId,
            moduleId,
          ),
          eq(freestyleModulesConfigurationsTable.userId, userId),
        ),
      );

    // Map configurations to a more user-friendly format
    const configMap = configurations.map((config) => ({
      environmentVariableRequirementId:
        config.FreestyleModulesEnvironmentVariableRequirements.id,
      name: config.FreestyleModulesEnvironmentVariableRequirements.name,
      value: config.FreestyleModulesConfigurations.value,
    }));

    return NextResponse.json({
      moduleId,
      requirements,
      configurations: configMap,
    });
  } catch (error) {
    console.error("Error fetching module configuration:", error);
    return NextResponse.json(
      { message: "Failed to fetch module configuration" },
      { status: 500 },
    );
  }
}

