DROP TABLE "ModuleConfig" CASCADE;--> statement-breakpoint
ALTER TABLE "FreestyleModules" ADD COLUMN "node_modules" json NOT NULL;