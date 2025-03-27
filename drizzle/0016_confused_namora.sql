CREATE TABLE "ModuleRequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"moduleId" uuid NOT NULL,
	"toolCallId" varchar(128) NOT NULL,
	"reason" text NOT NULL,
	"state" varchar(32) NOT NULL,
	"configValues" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ModuleRequests" ADD CONSTRAINT "ModuleRequests_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModuleRequests" ADD CONSTRAINT "ModuleRequests_moduleId_FreestyleModules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."FreestyleModules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ModuleRequests_chatId_index" ON "ModuleRequests" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "ModuleRequests_toolCallId_index" ON "ModuleRequests" USING btree ("toolCallId");--> statement-breakpoint
CREATE INDEX "FreestyleModulesEnvironmentVariableRequirements_id_index" ON "FreestyleModulesEnvironmentVariableRequirements" USING btree ("id");