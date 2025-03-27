ALTER TABLE "Messages" ALTER COLUMN "id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "Messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "Messages" ADD COLUMN "external_id" varchar(128);--> statement-breakpoint
CREATE UNIQUE INDEX "Messages_external_id_index" ON "Messages" USING btree ("external_id");