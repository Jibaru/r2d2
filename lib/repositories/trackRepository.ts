import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db/connection";
import { tracks, type TrackContent } from "@/lib/db/schema";
import type { Track, TrackMetadata } from "@/lib/types";

export interface TrackData {
	id: string;
	stationId: string;
	content: TrackContent;
	orderIndex: number;
	createdAt: Date;
	updatedAt: Date;
}

export class TrackRepository {
	async create(
		stationId: string,
		content: Omit<TrackContent, "stationId">,
		orderIndex = 0,
	): Promise<TrackData> {
		const id = nanoid();
		const trackContent: TrackContent = {
			...content,
			stationId,
		};

		const [result] = await db
			.insert(tracks)
			.values({
				id,
				stationId,
				content: trackContent,
				orderIndex,
			})
			.returning();

		return {
			...result,
			content: result.content as TrackContent,
		};
	}

	async findById(id: string): Promise<TrackData | null> {
		const [result] = await db.select().from(tracks).where(eq(tracks.id, id));

		if (!result) return null;

		return {
			...result,
			content: result.content as TrackContent,
		};
	}

	async findByStationId(stationId: string): Promise<TrackData[]> {
		const results = await db
			.select()
			.from(tracks)
			.where(eq(tracks.stationId, stationId))
			.orderBy(tracks.orderIndex, tracks.createdAt);

		return results.map((result) => ({
			...result,
			content: result.content as TrackContent,
		}));
	}

	async update(
		id: string,
		updates: Partial<TrackContent>,
	): Promise<TrackData | null> {
		const existing = await this.findById(id);
		if (!existing) return null;

		const updatedContent = { ...existing.content, ...updates };

		const [result] = await db
			.update(tracks)
			.set({
				content: updatedContent,
				updatedAt: new Date(),
			})
			.where(eq(tracks.id, id))
			.returning();

		if (!result) return null;

		return {
			...result,
			content: result.content as TrackContent,
		};
	}

	async delete(id: string): Promise<boolean> {
		const result = await db.delete(tracks).where(eq(tracks.id, id)).returning();
		return result.length > 0;
	}

	async deleteByStationId(stationId: string): Promise<number> {
		const result = await db
			.delete(tracks)
			.where(eq(tracks.stationId, stationId))
			.returning();
		return result.length;
	}

	async getNextOrderIndex(stationId: string): Promise<number> {
		const [result] = await db
			.select()
			.from(tracks)
			.where(eq(tracks.stationId, stationId))
			.orderBy(desc(tracks.orderIndex))
			.limit(1);

		return result ? result.orderIndex + 1 : 0;
	}

	toTrack(trackData: TrackData): Track {
		const content = trackData.content;
		return {
			id: trackData.id,
			stationId: trackData.stationId,
			url: `/api/music/cache/${trackData.id}`,
			filePath: content.filePath,
			duration: content.duration,
			orderIndex: trackData.orderIndex,
			state: "ready",
			metadata: {
				title: content.title,
				artist: "AI Generated",
				genre: content.stationId,
				styles: [],
				generatedAt: new Date(content.generatedAt),
			},
		};
	}
}
