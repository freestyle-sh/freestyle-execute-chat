CREATE TYPE "public"."ModuleVarRequirementSource" AS ENUM('text', 'oauth');--> statement-breakpoint
ALTER TABLE "FreestyleModulesEnvironmentVariableRequirements" ADD COLUMN "source" "ModuleVarRequirementSource" DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "FreestyleModulesEnvironmentVariableRequirements" ADD COLUMN "oauthProvider" varchar(64);--> statement-breakpoint
ALTER TABLE "FreestyleModulesEnvironmentVariableRequirements" ADD COLUMN "oauthScopes" json;