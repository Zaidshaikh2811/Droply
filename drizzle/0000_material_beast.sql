CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"path" varchar NOT NULL,
	"size" integer NOT NULL,
	"type" varchar NOT NULL,
	"file_url" text NOT NULL,
	"thumbnail_url" text,
	"user_id" text NOT NULL,
	"parent_id" text,
	"is_folder" boolean DEFAULT false NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_trash" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
