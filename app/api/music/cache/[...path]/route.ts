import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import type { NextRequest } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: { path: string[] } },
) {
	try {
		const cacheDir = process.env.CACHE_DIR || "./server/storage/cache";
		const filePath = `${cacheDir}/${params.path.join("/")}`;

		if (!existsSync(filePath)) {
			return Response.json({ error: "File not found" }, { status: 404 });
		}

		const stats = await stat(filePath);
		const stream = createReadStream(filePath);

		return new Response(stream as unknown as ReadableStream, {
			headers: {
				"Content-Type": "audio/mpeg",
				"Content-Length": stats.size.toString(),
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("Cache serve error:", error);
		return Response.json({ error: "Failed to serve file" }, { status: 500 });
	}
}
