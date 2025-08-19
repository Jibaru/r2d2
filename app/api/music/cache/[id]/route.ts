import { TrackRepository } from "@/lib/repositories/trackRepository";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import type { NextRequest } from "next/server";
import { join } from "path";

const trackRepo = new TrackRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const resolvedParams = await params;
		const trackData = await trackRepo.findById(resolvedParams.id);

		if (!trackData) {
			return Response.json({ error: "Track not found" }, { status: 404 });
		}

		const filePath = trackData.content.filePath;

		// Check if file exists
		try {
			await stat(filePath);
		} catch {
			return Response.json({ error: "Audio file not found" }, { status: 404 });
		}

		// Create a readable stream
		const stream = createReadStream(filePath);

		// Set appropriate headers for audio streaming
		const headers = {
			"Content-Type": "audio/mpeg",
			"Accept-Ranges": "bytes",
			"Cache-Control": "public, max-age=31536000", // Cache for 1 year
		};

		// Return the stream as response
		return new Response(stream as any, {
			status: 200,
			headers,
		});
	} catch (error) {
		console.error("Failed to serve audio file:", error);
		return Response.json(
			{ error: "Failed to serve audio file" },
			{ status: 500 },
		);
	}
}
