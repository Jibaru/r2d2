export interface StationProfile {
	id: string;
	requiredGenres: string[];
	selectedStyles: string[];
	seed?: string | number;
}

export interface Track {
	id: string;
	url?: string;
	metadata: TrackMetadata;
	duration?: number;
	state: TrackState;
}

export interface TrackMetadata {
	title?: string;
	artist?: string;
	genre: string;
	styles: string[];
	generatedAt: Date;
}

export type TrackState =
	| "pending"
	| "generating"
	| "ready"
	| "playing"
	| "failed";

export interface QueueState {
	tracks: Track[];
	currentIndex: number;
	isPlaying: boolean;
}

export interface CompositionRequest {
	stationId: string;
	durationMs: number;
	seed?: string | number;
}

export interface CompositionResponse {
	url: string;
	trackId: string;
	metadata: TrackMetadata;
}
