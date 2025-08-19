export interface GenrePreset {
	genre: string;
	styles: string[];
}

export const genrePresets: GenrePreset[] = [
	{
		genre: "lofi",
		styles: [
			"lofi hip-hop",
			"chilled piano lofi",
			"nostalgic lofi",
			"jazzy lofi",
			"instrumental lofi",
			"lofi ambient",
			"study lofi",
			"lofi with vinyl crackle",
		],
	},
	{
		genre: "ambient",
		styles: [
			"dark ambient",
			"space ambient",
			"drone ambient",
			"field recording ambient",
			"cinematic ambient",
			"nature ambient",
			"minimal ambient",
			"ethereal ambient",
		],
	},
	{
		genre: "jazz",
		styles: [
			"smooth jazz",
			"bebop jazz",
			"cool jazz",
			"fusion jazz",
			"acid jazz",
			"latin jazz",
			"contemporary jazz",
			"jazz ballads",
		],
	},
	{
		genre: "electronic",
		styles: [
			"synthwave",
			"chillwave",
			"downtempo",
			"future garage",
			"ambient techno",
			"deep house",
			"melodic dubstep",
			"IDM",
		],
	},
];

export function getStylesForGenre(genre: string): string[] {
	const preset = genrePresets.find((p) => p.genre === genre);
	return preset?.styles || [];
}

export function getAllGenres(): string[] {
	return genrePresets.map((preset) => preset.genre);
}
