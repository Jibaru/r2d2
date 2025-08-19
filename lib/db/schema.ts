import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export interface StationContent {
	requiredGenres: string[];
	selectedStyles: string[];
	seed?: string | number;
	name?: string;
	metadata?: Record<string, unknown>;
}

export const stations = pgTable("stations", {
	id: text("id").primaryKey(),
	content: jsonb("content").$type<StationContent>().notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
