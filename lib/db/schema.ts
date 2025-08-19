import { pgTable, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export interface StationContent {
	requiredGenres: string[];
	selectedStyles: string[];
	seed?: string | number;
	name?: string;
	metadata?: Record<string, unknown>;
}

export interface TrackContent {
	title?: string;
	duration: number;
	filePath: string;
	generatedAt: string;
	stationId: string;
	compositionPlan?: Record<string, unknown>;
	metadata?: Record<string, unknown>;
}

export const stations = pgTable("stations", {
	id: text("id").primaryKey(),
	content: jsonb("content").$type<StationContent>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tracks = pgTable("tracks", {
	id: text("id").primaryKey(),
	stationId: text("station_id").notNull(),
	content: jsonb("content").$type<TrackContent>().notNull(),
	orderIndex: integer("order_index").notNull().default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
