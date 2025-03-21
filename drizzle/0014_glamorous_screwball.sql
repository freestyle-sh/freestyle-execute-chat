ALTER TABLE "UserFormResponse" DROP CONSTRAINT "UserFormResponse_chatId_Chats_id_fk";
--> statement-breakpoint
ALTER TABLE "UserFormResponse" ADD CONSTRAINT "UserFormResponse_chatId_Chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chats"("id") ON DELETE cascade ON UPDATE no action;