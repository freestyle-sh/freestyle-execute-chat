ALTER TABLE "Chats" DROP CONSTRAINT "Chats_user_id_User_id_fk";
--> statement-breakpoint
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_chat_id_Chats_id_fk";
--> statement-breakpoint
ALTER TABLE "Chats" ADD COLUMN "name" varchar(256);--> statement-breakpoint
ALTER TABLE "Messages" ADD COLUMN "parts" json NOT NULL;--> statement-breakpoint
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_chat_id_Chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;