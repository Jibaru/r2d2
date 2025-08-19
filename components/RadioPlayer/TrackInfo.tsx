import { Badge } from "@/components/ui/badge";
import type { Track } from "@/lib/types";

interface TrackInfoProps {
	track: Track | null;
	stationName?: string;
}

export function TrackInfo({ track, stationName }: TrackInfoProps) {
	if (!track) {
		return (
			<div className="py-4 text-center">
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
			<div className="mt-2 flex flex-wrap justify-center gap-1">
				{track.metadata.styles.map((style) => (
					<Badge key={style} variant="secondary">
						{style}
					</Badge>
				))}
			</div>
		</div>
	);
}
