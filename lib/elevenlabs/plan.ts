import type { StationProfile } from "@/lib/types";
import type { MusicPrompt } from "@elevenlabs/elevenlabs-js/api";

export function createCompositionPlanForStation(
	profile: StationProfile,
	durationMs = 120_000,
): MusicPrompt {
	const totalDuration = durationMs;
	const numSections = Math.min(
		3,
		Math.max(2, Math.floor(totalDuration / 30000)),
	);
	const baseSectionDuration = Math.floor(totalDuration / numSections);

	const sections = [];

	for (let i = 0; i < numSections; i++) {
		const isIntro = i === 0;
		const isOutro = i === numSections - 1;
		const sectionDuration =
			i === numSections - 1
				? totalDuration - baseSectionDuration * (numSections - 1)
				: baseSectionDuration;

		let sectionName: string;
		let positiveLocalStyles: string[];
		let negativeLocalStyles: string[];

		if (isIntro) {
			sectionName = "Intro";
			positiveLocalStyles = [
				"soft ambient pads",
				"vinyl crackle",
				"gentle entry",
			];
			negativeLocalStyles = ["heavy drums", "loud bass", "aggressive"];
		} else if (isOutro) {
			sectionName = "Outro";
			positiveLocalStyles = [
				"smooth fade",
				"gentle resolution",
				"ambient textures",
			];
			negativeLocalStyles = [
				"abrupt cuts",
				"heavy percussion",
				"sudden changes",
			];
		} else {
			sectionName = `Main Section ${i}`;
			positiveLocalStyles = [
				...profile.selectedStyles.slice(i - 1, i + 1),
				"warm reverb",
				"smooth progression",
			];
			negativeLocalStyles = ["jarring transitions", "dissonant", "chaotic"];
		}

		sections.push({
			sectionName,
			positiveLocalStyles,
			negativeLocalStyles,
			durationMs: sectionDuration,
			lines: [],
		});
	}

	return {
		positiveGlobalStyles: [
			...profile.selectedStyles,
			"warm reverb",
			"vinyl crackle",
			"70-80 bpm",
			"smooth transitions",
		],
		negativeGlobalStyles: [
			"aggressive",
			"loud",
			"fast-paced",
			"distorted",
			"harsh",
			"dissonant",
		],
		sections,
	};
}
