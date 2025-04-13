CREATE TABLE "FreestyleModulesEnvironmentVariableRequirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moduleId" uuid,
	"name" varchar(256) NOT NULL,
	"description" text,
	"example" text,
	"required" boolean DEFAULT true NOT NULL,
	"public" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "FreestyleModules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"svg" text NOT NULL,
	"color" varchar(16) NOT NULL,
	"created_at" timestamp NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"setup_instructions" text,
	"documentation" text
);
--> statement-breakpoint
ALTER TABLE "FreestyleModulesEnvironmentVariableRequirements" ADD CONSTRAINT "FreestyleModulesEnvironmentVariableRequirements_moduleId_FreestyleModules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."FreestyleModules"("id") ON DELETE cascade ON UPDATE no action;