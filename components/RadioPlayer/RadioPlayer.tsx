"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQueue } from "@/hooks/useQueue";
import type { StationProfile } from "@/lib/types";
import { PlayerControls } from "./PlayerControls";
import { ProgressBar } from "./ProgressBar";
import { TrackInfo } from "./TrackInfo";

interface RadioPlayerProps {
	stationProfile: StationProfile;
	stationName?: string;
}

export function RadioPlayer({ stationProfile, stationName }: RadioPlayerProps) {
	const {
		currentTrack,
		currentTime,
		duration,
		isPlaying,
		play,
		pause,
		next,
		previous,
	} = useQueue(stationProfile);

	const isLoading = !currentTrack || currentTrack.state === "generating";

	return (
		<Card className="max-w-md mx-auto">
			<CardContent className="p-6">
				<TrackInfo track={currentTrack} stationName={stationName} />

				<div className="mt-4 space-y-4">
					<ProgressBar currentTime={currentTime} duration={duration} />

					<PlayerControls
						isPlaying={isPlaying}
						onPlay={play}
						onPause={pause}
						onNext={next}
						onPrevious={previous}
						disabled={isLoading}
					/>
				</div>

				{isLoading && (
					<div className="mt-4 text-center">
						<p className="text-sm text-muted-foreground">Generating track...</p>
					</div>
				)}

				{currentTrack?.state === "failed" && (
					<div className="mt-4 text-center">
						<p className="text-sm text-destructive">
							Failed to generate track. Trying next...
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
