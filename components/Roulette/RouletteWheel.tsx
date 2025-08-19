"use client";

import { Button } from "@/components/ui/button";
import { createStationFromRoulette, regenerateStation } from "@/lib/roulette";
import type { StationProfile } from "@/lib/types";
import { generateStationId } from "@/lib/utils/ids";
import { useState } from "react";
import { GenreSelector } from "./GenreSelector";
import { StylesDisplay } from "./StylesDisplay";

interface RouletteWheelProps {
	onStationCreated: (station: StationProfile) => void;
}

export function RouletteWheel({ onStationCreated }: RouletteWheelProps) {
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [stylesPerGenre, setStylesPerGenre] = useState(4);
	const [currentStyles, setCurrentStyles] = useState<string[]>([]);
	const [currentSeed, setCurrentSeed] = useState<string>("");

	const handleGenreToggle = (genre: string) => {
		setSelectedGenres((prev) =>
			prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
		);
		// Clear current styles when genres change
		setCurrentStyles([]);
	};

	const spinRoulette = () => {
		if (selectedGenres.length === 0) return;

		const result = createStationFromRoulette({
			requiredGenres: selectedGenres,
			stylesPerGenre,
		});

		setCurrentStyles(result.selectedStyles);
		setCurrentSeed(result.seed);
	};

	const regenerateStyles = () => {
		if (selectedGenres.length === 0) return;

		const result = regenerateStation({
			requiredGenres: selectedGenres,
			stylesPerGenre,
		});

		setCurrentStyles(result.selectedStyles);
		setCurrentSeed(result.seed);
	};

	const createStation = async () => {
		if (currentStyles.length === 0) return;

		try {
			const stationId = generateStationId();
			const station: StationProfile = {
				id: stationId,
				requiredGenres: selectedGenres,
				selectedStyles: currentStyles,
				seed: currentSeed,
			};

			// Save station to database
			const response = await fetch("/api/stations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(station),
			});

			if (!response.ok) {
				throw new Error("Failed to create station");
			}

			const savedStation = await response.json();
			onStationCreated(savedStation);
		} catch (error) {
			console.error("Failed to create station:", error);
			// Still navigate even if save fails, using local data
			const station: StationProfile = {
				id: generateStationId(),
				requiredGenres: selectedGenres,
				selectedStyles: currentStyles,
				seed: currentSeed,
			};
			onStationCreated(station);
		}
	};

	const canSpin = selectedGenres.length > 0;
	const canCreate = currentStyles.length > 0;

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="text-center">
				<h2 className="text-2xl font-bold mb-2">Station Roulette</h2>
				<p className="text-muted-foreground">
					Create your perfect radio station by selecting genres and spinning the
					style roulette
				</p>
			</div>

			<GenreSelector
				selectedGenres={selectedGenres}
				onGenreToggle={handleGenreToggle}
			/>

			<div className="space-y-4">
				<div>
					<label
						htmlFor="styles-per-genre"
						className="block text-sm font-medium mb-2"
					>
						Styles per genre: {stylesPerGenre}
					</label>
					<input
						id="styles-per-genre"
						type="range"
						min="2"
						max="8"
						value={stylesPerGenre}
						onChange={(e) => setStylesPerGenre(Number(e.target.value))}
						className="w-full"
					/>
				</div>

				<div className="flex gap-3 justify-center">
					<Button onClick={spinRoulette} disabled={!canSpin} size="lg">
						🎲 Spin Roulette
					</Button>

					{currentStyles.length > 0 && (
						<Button onClick={regenerateStyles} variant="outline" size="lg">
							🔄 Regenerate
						</Button>
					)}
				</div>
			</div>

			{currentStyles.length > 0 && (
				<div className="border rounded-lg p-4 space-y-4">
					<StylesDisplay styles={currentStyles} title="Your Station Styles" />

					<div className="text-center">
						<Button onClick={createStation} disabled={!canCreate} size="lg">
							🎵 Create Station
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
