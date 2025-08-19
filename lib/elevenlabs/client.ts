import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

export const elevenlabs = new ElevenLabsClient({
	apiKey: process.env.ELEVENLABS_API_KEY,
});
