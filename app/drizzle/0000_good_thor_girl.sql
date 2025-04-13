CREATE TABLE "Chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ModuleConfig" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moduleId" varchar(64) NOT NULL,
	"userId" uuid,
	"enabled" boolean DEFAULT false NOT NULL,
	"envVars" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stack_id" varchar(64) NOT NULL
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
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chat_id_Chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."Chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ModuleConfig" ADD CONSTRAINT "ModuleConfig_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserFormResponse" ADD CONSTRAINT "UserFormResponse_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE no action ON UPDATE no action;