import { elevenlabs } from "@/lib/elevenlabs/client";
import { createCompositionPlanForStation } from "@/lib/elevenlabs/plan";
import { StationRepository } from "@/lib/repositories/stationRepository";
import { TrackRepository } from "@/lib/repositories/trackRepository";
import type { CompositionRequest } from "@/lib/types";
import { composeLock } from "@/lib/utils/composeLock";
import { generateTrackId } from "@/lib/utils/ids";
import type { NextRequest } from "next/server";
import { UTApi } from "uploadthing/server";

const stationRepo = new StationRepository();
const trackRepo = new TrackRepository();
const utapi = new UTApi();

async function uploadStreamToUploadThing(
	stream: ReadableStream,
	filename: string,
): Promise<string> {
	// Convert stream to buffer
	const response = new Response(stream);
	const buffer = await response.arrayBuffer();

	// Create a File object from the buffer
	const file = new File([buffer], filename, { type: "audio/mpeg" });

	// Upload using UTApi
	const uploadResult = await utapi.uploadFiles(file);

	if (uploadResult.error) {
		throw new Error(`UploadThing error: ${uploadResult.error.message}`);
	}

	return uploadResult.data.ufsUrl;
}

export async function POST(request: NextRequest) {
	// Acquire lock to ensure sequential compose calls
	await composeLock.acquire();

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

		// Generate track with ElevenLabs (sequential - only one at a time)
		const trackStream = await elevenlabs.music.compose({ compositionPlan });

		const trackId = generateTrackId();
		const filename = `${trackId}.mp3`;

		// Upload to UploadThing
		const fileUrl = await uploadStreamToUploadThing(trackStream, filename);

		// Get next order index for this station
		const orderIndex = await trackRepo.getNextOrderIndex(stationId);

		// Save track to database with UploadThing URL
		const trackData = await trackRepo.create(
			stationId,
			{
				title: `Track ${orderIndex + 1}`,
				duration: durationMs,
				filePath: fileUrl,
				generatedAt: new Date().toISOString(),
				compositionPlan: compositionPlan as unknown as Record<string, unknown>,
				metadata: {
					genre: profile.requiredGenres.join(", "),
					styles: profile.selectedStyles,
				},
			},
			orderIndex,
		);

		return Response.json({
			url: fileUrl,
			trackId: trackData.id,
			metadata: {
				title: trackData.content.title,
				artist: "AI Generated",
				genre: profile.requiredGenres.join(", "),
				styles: profile.selectedStyles,
				generatedAt: new Date(trackData.content.generatedAt),
			},
		});
	} catch (error) {
		console.error("Composition error:", error);
		return Response.json({ error: "Failed to compose track" }, { status: 500 });
	} finally {
		// Always release the lock
		composeLock.release();
	}
}
