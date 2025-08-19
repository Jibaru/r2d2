import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export async function saveStreamAsMP3(
	stream: ReadableStream<Uint8Array>,
	filePath: string,
): Promise<string> {
	await mkdir(dirname(filePath), { recursive: true });

	const fileStream = createWriteStream(filePath);
	const reader = stream.getReader();

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			fileStream.write(Buffer.from(value));
		}

		fileStream.end();

		return new Promise((resolve, reject) => {
			fileStream.on("finish", () => resolve(filePath));
			fileStream.on("error", reject);
		});
	} finally {
		reader.releaseLock();
	}
}
