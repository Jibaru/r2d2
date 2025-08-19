import { Button } from "@/components/ui/button";
import { getAllGenres } from "@/lib/presets";

interface GenreSelectorProps {
	selectedGenres: string[];
	onGenreToggle: (genre: string) => void;
}

export function GenreSelector({
	selectedGenres,
	onGenreToggle,
}: GenreSelectorProps) {
	const allGenres = getAllGenres();

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Required Genres</h3>
			<p className="text-sm text-muted-foreground">
				Select the genres that must be included in your station
			</p>

			<div className="flex flex-wrap gap-2">
				{allGenres.map((genre) => {
					const isSelected = selectedGenres.includes(genre);
					return (
						<Button
							key={genre}
							variant={isSelected ? "default" : "outline"}
							size="sm"
							onClick={() => onGenreToggle(genre)}
						>
							{genre}
							{isSelected && " ✓"}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
