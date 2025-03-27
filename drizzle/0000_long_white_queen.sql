CREATE TABLE "ChatModulesEnabled" (
	"chatId" uuid NOT NULL,
	"moduleId" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	CONSTRAINT "ChatModulesEnabled_chatId_moduleId_pk" PRIMARY KEY("chatId","moduleId")
);
--> statement-breakpoint
CREATE TABLE "Chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"name" varchar(256),
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "FreestyleModulesConfigurations" (
	"userId" uuid NOT NULL,
	"environmentVariableId" uuid NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "FreestyleModulesConfigurations_userId_environmentVariableId_pk" PRIMARY KEY("userId","environmentVariableId")
);
--> statement-breakpoint
CREATE TABLE "FreestyleModulesEnvironmentVariableRequirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moduleId" uuid NOT NULL,
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
	"example" text NOT NULL,
	"svg" text NOT NULL,
	"lightModeColor" varchar(16) NOT NULL,
	"darkModeColor" varchar(16) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"node_modules" json NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"setup_instructions" text,
	"documentation" text,
	"_special_behavior" json
);
--> statement-breakpoint
CREATE TABLE "Messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid,
	"content" text NOT NULL,
	"parts" json NOT NULL,
	"role" varchar(16) NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ModuleRequests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"moduleId" uuid NOT NULL,
	"toolCallId" varchar(128) NOT NULL,
	"reason" text NOT NULL,
	"state" varchar(32) NOT NULL,
	"configValues" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ModuleRequests_toolCallId_unique" UNIQUE("toolCallId")
);
--> statement-breakpoint
CREATE TABLE "UserFormResponse" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatId" uuid NOT NULL,
	"toolCallId" varchar(128) NOT NULL,
	"formTitle" varchar(256),
	"state" varchar(32) NOT NULL,
	"formData" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stack_id" varchar(64) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ChatModulesEnabled" ADD CONSTRAINT "ChatModulesEnabled_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ChatModulesEnabled" ADD CONSTRAINT "ChatModulesEnabled_moduleId_FreestyleModules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."FreestyleModules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FreestyleModulesConfigurations" ADD CONSTRAINT "FreestyleModulesConfigurations_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FreestyleModulesConfigurations" ADD CONSTRAINT "FreestyleModulesConfigurations_environmentVariableId_FreestyleModulesEnvironmentVariableRequirements_id_fk" FOREIGN KEY ("environmentVariableId") REFERENCES "public"."FreestyleModulesEnvironmentVariableRequirements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "FreestyleModulesEnvironmentVariableRequirements" ADD CONSTRAINT "FreestyleModulesEnvironmentVariableRequirements_moduleId_FreestyleModules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."FreestyleModules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chat_id_Chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModuleRequests" ADD CONSTRAINT "ModuleRequests_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModuleRequests" ADD CONSTRAINT "ModuleRequests_moduleId_FreestyleModules_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."FreestyleModules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserFormResponse" ADD CONSTRAINT "UserFormResponse_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ChatModulesEnabled_chatId_index" ON "ChatModulesEnabled" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "FreestyleModulesConfigurations_userId_index" ON "FreestyleModulesConfigurations" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "FreestyleModulesEnvironmentVariableRequirements_moduleId_index" ON "FreestyleModulesEnvironmentVariableRequirements" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "FreestyleModulesEnvironmentVariableRequirements_id_index" ON "FreestyleModulesEnvironmentVariableRequirements" USING btree ("id");--> statement-breakpoint
CREATE INDEX "Messages_chat_id_index" ON "Messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "ModuleRequests_chatId_index" ON "ModuleRequests" USING btree ("chatId");--> statement-breakpoint
CREATE INDEX "ModuleRequests_toolCallId_index" ON "ModuleRequests" USING btree ("toolCallId");