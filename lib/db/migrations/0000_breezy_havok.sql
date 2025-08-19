CREATE TABLE IF NOT EXISTS "stations" (
	"id" text PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
