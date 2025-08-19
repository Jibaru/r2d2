import { saveStreamAsMP3 } from "@/lib/audio/saveStream";
import { elevenlabs } from "@/lib/elevenlabs/client";
import { createCompositionPlanForStation } from "@/lib/elevenlabs/plan";
import { StationRepository } from "@/lib/repositories/stationRepository";
import { TrackRepository } from "@/lib/repositories/trackRepository";
import type { CompositionRequest } from "@/lib/types";
import { generateTrackId } from "@/lib/utils/ids";
import type { NextRequest } from "next/server";

const stationRepo = new StationRepository();
const trackRepo = new TrackRepository();

export async function POST(request: NextRequest) {
	try {
		const body: CompositionRequest = await request.json();
		const { stationId, durationMs } = body;

		// Get station profile from database
		const stationData = await stationRepo.findById(stationId);
		if (!stationData) {
			return Response.json({ error: "Station not found" }, { status: 404 });
		}

		const profile = await stationRepo.toStationProfile(stationData);
		const compositionPlan = createCompositionPlanForStation(
			profile,
			durationMs,
		);
		const trackStream = await elevenlabs.music.compose({ compositionPlan });

		const trackId = generateTrackId();
		const cacheDir = process.env.CACHE_DIR || "./server/storage/cache";
		const filename = `${trackId}.mp3`;
		const filePath = `${cacheDir}/${stationId}/${filename}`;

		await saveStreamAsMP3(trackStream, filePath);

		// Get next order index for this station
		const orderIndex = await trackRepo.getNextOrderIndex(stationId);

		// Save track to database
		const trackData = await trackRepo.create(
			stationId,
			{
				title: `Track ${orderIndex + 1}`,
				duration: durationMs,
				filePath,
				generatedAt: new Date().toISOString(),
				compositionPlan: compositionPlan as unknown as Record<string, unknown>,
				metadata: {
					genre: profile.requiredGenres.join(", "),
					styles: profile.selectedStyles,
				},
			},
			orderIndex,
		);

		const track = trackRepo.toTrack(trackData);

		return Response.json({
			url: track.url,
			trackId: track.id,
			metadata: track.metadata,
		});
	} catch (error) {
		console.error("Composition error:", error);
		return Response.json({ error: "Failed to compose track" }, { status: 500 });
	}
}
