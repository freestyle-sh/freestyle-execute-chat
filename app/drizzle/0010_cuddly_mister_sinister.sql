ALTER TABLE "FreestyleModules" RENAME COLUMN "color" TO "lightModeColor";--> statement-breakpoint
ALTER TABLE "FreestyleModules" ADD COLUMN "darkModeColor" varchar(16) NOT NULL;