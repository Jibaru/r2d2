import { Badge } from "@/components/ui/badge";
import type { Track } from "@/lib/types";

interface TrackInfoProps {
	track: Track | null;
	stationName?: string;
}

export function TrackInfo({ track, stationName }: TrackInfoProps) {
	if (!track) {
		return (
			<div className="text-center py-4">
				<p className="text-muted-foreground">No track loaded</p>
			</div>
		);
	}

	return (
		<div className="text-center">
			<h3 className="font-semibold text-lg">
				{track.metadata.title || "Untitled Track"}
			</h3>
			<p className="text-muted-foreground">
				{stationName || track.metadata.genre}
			</p>
			<div className="flex flex-wrap gap-1 justify-center mt-2">
				{track.metadata.styles.map((style) => (
					<Badge key={style} variant="secondary">
						{style}
					</Badge>
				))}
			</div>
		</div>
	);
}
