import { db } from "@/db";
import {
  freestyleModulesEnvironmentVariableRequirementsTable,
  freestyleModulesTable,
} from "@/db/schema";
import { siPostgresql } from "simple-icons";
export default async function initPostgres() {
  const postgres = await db
    .insert(freestyleModulesTable)
    .values({
      name: "postgres",
      svg: siPostgresql.svg,
      color: siPostgresql.hex,
      nodeModules: {
        pg: "8.14.0",
      },
      example: `Get and manipulate data from your PostgreSQL database`,
    })
    .returning();

  await db.insert(freestyleModulesEnvironmentVariableRequirementsTable).values({
    moduleId: postgres[0].id,
    name: "POSTGRES_URL",
    description: "PostgreSQL connection URL",
    example: "postgres://user:password@localhost:5432/dbname",
  });
}
