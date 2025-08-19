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
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Loading station...</p>
				</div>
			</div>
		);
	}

	if (error || !station) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="mb-4 font-bold text-2xl">Station Not Found</h1>
					<p className="mb-4 text-muted-foreground">
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
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl">{stationName}</h1>
					<p className="text-muted-foreground">Station ID: {station.id}</p>
				</div>

				<RadioPlayer stationProfile={station} stationName={stationName} />

				<div className="mx-auto mt-8 max-w-2xl">
					<h2 className="mb-4 font-semibold text-xl">Station Details</h2>

					<div className="space-y-4">
						<div>
							<h3 className="mb-2 font-medium">Required Genres</h3>
							<div className="flex flex-wrap gap-2">
								{station.requiredGenres.map((genre) => (
									<Badge key={genre} variant="default">
										{genre}
									</Badge>
								))}
							</div>
						</div>

						<div>
							<h3 className="mb-2 font-medium">Selected Styles</h3>
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
