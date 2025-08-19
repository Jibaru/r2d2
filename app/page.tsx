"use client";

import { RouletteWheel } from "@/components/Roulette/RouletteWheel";
import type { StationProfile } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
	const [showRoulette, setShowRoulette] = useState(false);
	const router = useRouter();

	const handleStationCreated = (station: StationProfile) => {
		// In a real app, you'd save this to a database
		// For now, just navigate to the station page
		router.push(`/station/${station.id}`);
	};

	if (showRoulette) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<RouletteWheel onStationCreated={handleStationCreated} />

					<div className="mt-8 text-center">
						<button
							type="button"
							onClick={() => setShowRoulette(false)}
							className="text-foreground underline opacity-70 hover:opacity-100"
						>
							← Back to home
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
			<main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
				<h1 className="text-center font-bold text-4xl sm:text-left">
					r2d2 Music Radio
				</h1>
				<p className="max-w-md text-center sm:text-left">
					Create on-demand radio stations with AI-generated music based on your
					favorite genres and styles.
				</p>
				<div className="flex flex-col items-center gap-4 sm:flex-row">
					<button
						type="button"
						onClick={() => setShowRoulette(true)}
						className="flex h-10 items-center justify-center gap-2 rounded-full border border-transparent border-solid bg-foreground px-4 text-background text-sm transition-colors hover:bg-[#383838] sm:h-12 sm:px-5 sm:text-base dark:hover:bg-[#ccc]"
					>
						Create Station
					</button>
				</div>
			</main>
		</div>
	);
}
