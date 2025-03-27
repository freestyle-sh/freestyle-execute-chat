ALTER TABLE "Messages" ADD COLUMN "external_id" varchar(128);--> statement-breakpoint
CREATE UNIQUE INDEX "Messages_external_id_index" ON "Messages" USING btree ("external_id");