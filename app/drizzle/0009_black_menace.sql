CREATE TABLE "FreestyleModulesConfigurations" (
	"userId" uuid,
	"environmentVariableId" uuid,
	"value" text NOT NULL,
	CONSTRAINT "FreestyleModulesConfigurations_userId_environmentVariableId_pk" PRIMARY KEY("userId","environmentVariableId")
);
--> statement-breakpoint
ALTER TABLE "FreestyleModulesConfigurations" ADD CONSTRAINT "FreestyleModulesConfigurations_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FreestyleModulesConfigurations" ADD CONSTRAINT "FreestyleModulesConfigurations_environmentVariableId_FreestyleModulesEnvironmentVariableRequirements_id_fk" FOREIGN KEY ("environmentVariableId") REFERENCES "public"."FreestyleModulesEnvironmentVariableRequirements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "FreestyleModulesConfigurations_userId_index" ON "FreestyleModulesConfigurations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "FreestyleModulesEnvironmentVariableRequirements_moduleId_index" ON "FreestyleModulesEnvironmentVariableRequirements" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "Messages_chat_id_index" ON "Messages" USING btree ("chat_id");