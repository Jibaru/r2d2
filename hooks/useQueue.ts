import type {
	CompositionResponse,
	QueueState,
	StationProfile,
	Track,
} from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

const PREFETCH_THRESHOLD = 2;
const DEFAULT_TRACK_DURATION = 120000; // 2 minutes

export function useQueue(stationProfile?: StationProfile) {
	const [queue, setQueue] = useState<QueueState>({
		tracks: [],
		currentIndex: 0,
		isPlaying: false,
	});

	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const isGeneratingRef = useRef(false); // Client-side generation lock

	const generateTrack = useCallback(
		async (stationId: string): Promise<Track> => {
			try {
				const response = await fetch("/api/music/compose", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						stationId,
						durationMs: DEFAULT_TRACK_DURATION,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to generate track");
				}

				const data: CompositionResponse = await response.json();

				return {
					id: data.trackId,
					url: data.url,
					metadata: data.metadata,
					state: "ready",
					stationId,
				};
			} catch (error) {
				console.error("Track generation failed:", error);
				return {
					id: `failed_${Date.now()}`,
					metadata: {
						genre: "unknown",
						styles: [],
						generatedAt: new Date(),
					},
					state: "failed",
					stationId,
				};
			}
		},
		[],
	);

	const prefetchNext = useCallback(async () => {
		if (!stationProfile || isGeneratingRef.current) return;

		const tracksToGenerate =
			PREFETCH_THRESHOLD - (queue.tracks.length - queue.currentIndex - 1);

		if (tracksToGenerate > 0) {
			isGeneratingRef.current = true; // Acquire client-side lock

			try {
				// Generate tracks sequentially, one by one
				for (let i = 0; i < tracksToGenerate; i++) {
					try {
						console.log(`Generating track ${i + 1} of ${tracksToGenerate}...`);
						const track = await generateTrack(stationProfile.id);

						// Add track to queue immediately after generation
						setQueue((prev) => ({
							...prev,
							tracks: [...prev.tracks, track],
						}));

						console.log(`Track ${i + 1} generated successfully`);
					} catch (error) {
						console.error(`Failed to generate track ${i + 1}:`, error);
						// Continue with next track even if one fails
					}
				}
			} finally {
				isGeneratingRef.current = false; // Release client-side lock
			}
		}
	}, [stationProfile, queue.tracks.length, queue.currentIndex, generateTrack]);

	const play = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.play();
			setQueue((prev) => ({ ...prev, isPlaying: true }));
		}
	}, []);

	const pause = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			setQueue((prev) => ({ ...prev, isPlaying: false }));
		}
	}, []);

	const next = useCallback(() => {
		setQueue((prev) => {
			const nextIndex = Math.min(prev.currentIndex + 1, prev.tracks.length - 1);
			return { ...prev, currentIndex: nextIndex };
		});
	}, []);

	const previous = useCallback(() => {
		setQueue((prev) => {
			const prevIndex = Math.max(prev.currentIndex - 1, 0);
			return { ...prev, currentIndex: prevIndex };
		});
	}, []);

	// Initialize audio element
	useEffect(() => {
		if (!audioRef.current) {
			audioRef.current = new Audio();

			audioRef.current.addEventListener("timeupdate", () => {
				setCurrentTime(audioRef.current?.currentTime || 0);
			});

			audioRef.current.addEventListener("loadedmetadata", () => {
				setDuration(audioRef.current?.duration || 0);
			});

			audioRef.current.addEventListener("ended", () => {
				next();
			});
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, [next]);

	// Update audio source when current track changes
	useEffect(() => {
		const currentTrack = queue.tracks[queue.currentIndex];
		if (currentTrack?.url && audioRef.current) {
			audioRef.current.src = currentTrack.url;
			if (queue.isPlaying) {
				audioRef.current.play();
			}
		}
	}, [queue.currentIndex, queue.tracks, queue.isPlaying]);

	// Prefetch tracks when needed
	useEffect(() => {
		prefetchNext();
	}, [prefetchNext]);

	// Initialize queue with existing tracks from station profile or generate new ones
	useEffect(() => {
		if (stationProfile && queue.tracks.length === 0) {
			// Load existing tracks from station profile if available
			if (stationProfile.tracks && stationProfile.tracks.length > 0) {
				setQueue((prev) => ({
					...prev,
					tracks: stationProfile.tracks || [],
				}));
			} else {
				// Generate new tracks if none exist
				prefetchNext();
			}
		}
	}, [stationProfile, queue.tracks.length, prefetchNext]);

	const currentTrack = queue.tracks[queue.currentIndex] || null;

	return {
		queue,
		currentTrack,
		currentTime,
		duration,
		isPlaying: queue.isPlaying,
		play,
		pause,
		next,
		previous,
	};
}
