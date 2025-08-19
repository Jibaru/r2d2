import { getStylesForGenre } from "./presets";

export interface RouletteConfig {
	requiredGenres: string[];
	stylesPerGenre: number;
	seed?: string | number;
}

export function createStationFromRoulette(config: RouletteConfig): {
	selectedStyles: string[];
	seed: string;
} {
	const { requiredGenres, stylesPerGenre, seed } = config;

	// Create deterministic random generator from seed
	const seedValue = seed?.toString() || Date.now().toString();
	let seedNum = hashString(seedValue);

	const seededRandom = () => {
		seedNum = (seedNum * 9301 + 49297) % 233280;
		return seedNum / 233280;
	};

	const selectedStyles: string[] = [];

	for (const genre of requiredGenres) {
		const availableStyles = getStylesForGenre(genre);

		if (availableStyles.length === 0) continue;

		// Shuffle styles with seeded random
		const shuffledStyles = [...availableStyles];
		for (let i = shuffledStyles.length - 1; i > 0; i--) {
			const j = Math.floor(seededRandom() * (i + 1));
			[shuffledStyles[i], shuffledStyles[j]] = [
				shuffledStyles[j],
				shuffledStyles[i],
			];
		}

		// Take the requested number of styles
		const numToTake = Math.min(stylesPerGenre, shuffledStyles.length);
		selectedStyles.push(...shuffledStyles.slice(0, numToTake));
	}

	return {
		selectedStyles,
		seed: seedValue,
	};
}

export function regenerateStation(config: RouletteConfig): {
	selectedStyles: string[];
	seed: string;
} {
	return createStationFromRoulette({
		...config,
		seed: Date.now().toString(),
	});
}

function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return Math.abs(hash);
}
