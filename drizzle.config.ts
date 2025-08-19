import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./lib/db/schema.ts",
	out: "./lib/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "postgresql://localhost:5432/r2d2",
	},
});
