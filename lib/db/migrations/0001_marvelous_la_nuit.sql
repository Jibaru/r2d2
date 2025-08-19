CREATE TABLE IF NOT EXISTS "tracks" (
	"id" text PRIMARY KEY NOT NULL,
	"station_id" text NOT NULL,
	"content" jsonb NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
