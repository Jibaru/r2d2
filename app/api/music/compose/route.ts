import { saveStreamAsMP3 } from "@/lib/audio/saveStream";
import { elevenlabs } from "@/lib/elevenlabs/client";
import { createCompositionPlanForStation } from "@/lib/elevenlabs/plan";
import type { CompositionRequest, StationProfile } from "@/lib/types";
import { generateTrackId } from "@/lib/utils/ids";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body: CompositionRequest = await request.json();
		const { stationId, durationMs } = body;

		const profile: StationProfile = {
			id: stationId,
			requiredGenres: ["lofi"],
			selectedStyles: [
				"lofi hip-hop",
				"chilled piano lofi",
				"nostalgic lofi",
				"study lofi",
			],
		};

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

		return Response.json({
			url: `/api/music/cache/${stationId}/${filename}`,
			trackId,
			metadata: {
				genre: "lofi",
				styles: profile.selectedStyles,
				generatedAt: new Date(),
			},
		});
	} catch (error) {
		console.error("Composition error:", error);
		return Response.json({ error: "Failed to compose track" }, { status: 500 });
	}
}
