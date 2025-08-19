import { eq } from "drizzle-orm";
import { db } from "@/lib/db/connection";
import { stations, type StationContent } from "@/lib/db/schema";
import type { StationProfile } from "@/lib/types";

export interface StationData {
	id: string;
	content: StationContent;
	createdAt: Date;
	updatedAt: Date;
}

export class StationRepository {
	async create(stationProfile: StationProfile): Promise<StationData> {
		const [station] = await db
			.insert(stations)
			.values({
				id: stationProfile.id,
				content: {
					requiredGenres: stationProfile.requiredGenres,
					selectedStyles: stationProfile.selectedStyles,
					seed: stationProfile.seed,
				},
				updatedAt: new Date(),
			})
			.returning();

		return station;
	}

	async findById(id: string): Promise<StationData | null> {
		const [station] = await db
			.select()
			.from(stations)
			.where(eq(stations.id, id))
			.limit(1);

		return station || null;
	}

	async update(
		id: string,
		updates: Partial<StationData["content"]>,
	): Promise<StationData | null> {
		const existing = await this.findById(id);
		if (!existing) return null;

		const [updated] = await db
			.update(stations)
			.set({
				content: { ...existing.content, ...updates },
				updatedAt: new Date(),
			})
			.where(eq(stations.id, id))
			.returning();

		return updated;
	}

	async delete(id: string): Promise<boolean> {
		const result = await db
			.delete(stations)
			.where(eq(stations.id, id))
			.returning();
		return result.length > 0;
	}

	async list(limit = 50, offset = 0): Promise<StationData[]> {
		return await db
			.select()
			.from(stations)
			.limit(limit)
			.offset(offset)
			.orderBy(stations.createdAt);
	}

	toStationProfile(stationData: StationData): StationProfile {
		return {
			id: stationData.id,
			requiredGenres: stationData.content.requiredGenres,
			selectedStyles: stationData.content.selectedStyles,
			seed: stationData.content.seed,
		};
	}
}
