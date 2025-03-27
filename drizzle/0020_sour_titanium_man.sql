ALTER TABLE "Messages" ALTER COLUMN "id" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "Messages" ALTER COLUMN "id" DROP DEFAULT;