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
	{
		genre: "hip-hop",
		styles: [
			"trap",
			"drill",
			"boom bap",
			"mumble rap",
			"conscious hip-hop",
			"phonk",
			"afro trap",
			"uk drill",
		],
	},
	{
		genre: "house",
		styles: [
			"deep house",
			"tech house",
			"progressive house",
			"future house",
			"melodic house",
			"amapiano",
			"future rave",
			"tropical house",
		],
	},
	{
		genre: "techno",
		styles: [
			"melodic techno",
			"minimal techno",
			"hard techno",
			"ambient techno",
			"industrial techno",
			"detroit techno",
			"progressive techno",
			"acid techno",
		],
	},
	{
		genre: "dubstep",
		styles: [
			"melodic dubstep",
			"riddim",
			"brostep",
			"future bass",
			"hybrid trap",
			"drum-step",
			"wobble-step",
			"liquid dubstep",
		],
	},
	{
		genre: "rock",
		styles: [
			"indie rock",
			"alternative rock",
			"classic rock",
			"punk rock",
			"progressive rock",
			"psychedelic rock",
			"post-rock",
			"garage rock",
		],
	},
	{
		genre: "pop",
		styles: [
			"electropop",
			"indie pop",
			"synth pop",
			"dream pop",
			"art pop",
			"hyperpop",
			"k-pop",
			"latin pop",
		],
	},
	{
		genre: "r&b",
		styles: [
			"neo-soul",
			"alternative r&b",
			"contemporary r&b",
			"smooth r&b",
			"retro soul",
			"experimental r&b",
			"gospel-influenced r&b",
			"trap soul",
		],
	},
	{
		genre: "classical",
		styles: [
			"baroque",
			"romantic",
			"contemporary classical",
			"minimalist classical",
			"orchestral",
			"chamber music",
			"neoclassical",
			"crossover classical",
		],
	},
	{
		genre: "folk",
		styles: [
			"indie folk",
			"acoustic folk",
			"folk rock",
			"americana",
			"traditional folk",
			"contemporary folk",
			"celtic folk",
			"world folk",
		],
	},
	{
		genre: "reggae",
		styles: [
			"roots reggae",
			"dancehall",
			"dub reggae",
			"reggae fusion",
			"digital reggae",
			"lovers rock",
			"reggaeton",
			"ska reggae",
		],
	},
	{
		genre: "funk",
		styles: [
			"classic funk",
			"p-funk",
			"funk rock",
			"electro funk",
			"jazz funk",
			"nu-funk",
			"afrofunk",
			"disco funk",
		],
	},
	{
		genre: "country",
		styles: [
			"contemporary country",
			"country rock",
			"bluegrass",
			"outlaw country",
			"country pop",
			"americana country",
			"honky-tonk",
			"alt-country",
		],
	},
	{
		genre: "metal",
		styles: [
			"progressive metal",
			"melodic metal",
			"symphonic metal",
			"post-metal",
			"atmospheric metal",
			"djent",
			"metalcore",
			"doom metal",
		],
	},
	{
		genre: "world",
		styles: [
			"afrobeats",
			"bossa nova",
			"flamenco",
			"middle eastern",
			"indian classical",
			"celtic",
			"latin fusion",
			"tribal world",
		],
	},
	{
		genre: "experimental",
		styles: [
			"avant-garde",
			"noise",
			"glitch",
			"microsound",
			"acousmatic",
			"electroacoustic",
			"sound art",
			"post-genre",
		],
	},
	{
		genre: "chill",
		styles: [
			"chillout",
			"chillhop",
			"chill trap",
			"ambient chill",
			"downtempo chill",
			"chill house",
			"lo-fi chill",
			"atmospheric chill",
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
