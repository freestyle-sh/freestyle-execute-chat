CREATE TABLE "ChatModulesEnabled" (
	"chatId" uuid,
	"moduleId" uuid,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ChatModulesEnabled_chatId_moduleId_pk" PRIMARY KEY("chatId","moduleId")
);
--> statement-breakpoint
ALTER TABLE "FreestyleModulesEnvironmentVariableRequirements" ALTER COLUMN "moduleId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ChatModulesEnabled" ADD CONSTRAINT "ChatModulesEnabled_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ChatModulesEnabled" ADD CONSTRAINT "ChatModulesEnabled_moduleId_FreestyleModules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."FreestyleModules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ChatModulesEnabled_chatId_index" ON "ChatModulesEnabled" USING btree ("chatId");