"use client";

import { RadioPlayer } from "@/components/RadioPlayer/RadioPlayer";
import { Badge } from "@/components/ui/badge";
import type { StationProfile } from "@/lib/types";
import { use, useEffect, useState } from "react";

async function fetchStationById(id: string): Promise<StationProfile | null> {
	try {
		const response = await fetch(`/api/stations/${id}`);
		if (!response.ok) {
			if (response.status === 404) return null;
			throw new Error("Failed to fetch station");
		}
		return await response.json();
	} catch (error) {
		console.error("Error fetching station:", error);
		// Fallback to demo data if database fails
		if (id === "demo") {
			return {
				id,
				requiredGenres: ["lofi"],
				selectedStyles: [
					"lofi hip-hop",
					"chilled piano lofi",
					"nostalgic lofi",
					"study lofi",
				],
				seed: "demo-seed",
			};
		}
		return null;
	}
}

interface StationPageProps {
	params: Promise<{ id: string }>;
}

export default function StationPage({ params }: StationPageProps) {
	const resolvedParams = use(params);
	const [station, setStation] = useState<StationProfile | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadStation = async () => {
			try {
				setIsLoading(true);
				const stationData = await fetchStationById(resolvedParams.id);
				setStation(stationData);
				setError(null);
			} catch (err) {
				setError("Failed to load station");
				console.error(err);
			} finally {
				setIsLoading(false);
			}
		};

		loadStation();
	}, [resolvedParams.id]);

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Loading station...</p>
				</div>
			</div>
		);
	}

	if (error || !station) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Station Not Found</h1>
					<p className="text-muted-foreground mb-4">
						{error || "The station you're looking for doesn't exist."}
					</p>
					<a href="/" className="text-foreground underline hover:no-underline">
						Go back home
					</a>
				</div>
			</div>
		);
	}

	const stationName = `${station.requiredGenres.join(" + ")} Station`;

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold mb-2">{stationName}</h1>
					<p className="text-muted-foreground">Station ID: {station.id}</p>
				</div>

				<RadioPlayer stationProfile={station} stationName={stationName} />

				<div className="mt-8 max-w-2xl mx-auto">
					<h2 className="text-xl font-semibold mb-4">Station Details</h2>

					<div className="space-y-4">
						<div>
							<h3 className="font-medium mb-2">Required Genres</h3>
							<div className="flex flex-wrap gap-2">
								{station.requiredGenres.map((genre) => (
									<Badge key={genre} variant="default">
										{genre}
									</Badge>
								))}
							</div>
						</div>

						<div>
							<h3 className="font-medium mb-2">Selected Styles</h3>
							<div className="flex flex-wrap gap-2">
								{station.selectedStyles.map((style) => (
									<Badge key={style} variant="outline">
										{style}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
