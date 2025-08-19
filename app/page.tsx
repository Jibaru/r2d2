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

					<div className="text-center mt-8">
						<button
							type="button"
							onClick={() => setShowRoulette(false)}
							className="text-foreground opacity-70 hover:opacity-100 underline"
						>
							← Back to home
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1 className="text-4xl font-bold text-center sm:text-left">
					r2d2 Music Radio
				</h1>
				<p className="text-center sm:text-left max-w-md">
					Create on-demand radio stations with AI-generated music based on your
					favorite genres and styles.
				</p>
				<div className="flex gap-4 items-center flex-col sm:flex-row">
					<button
						type="button"
						onClick={() => setShowRoulette(true)}
						className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
					>
						Create Station
					</button>

					<a
						href="/station/demo"
						className="rounded-full border border-solid border-foreground transition-colors flex items-center justify-center text-foreground gap-2 hover:bg-foreground hover:text-background text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
					>
						Try Demo Station
					</a>
				</div>
			</main>
		</div>
	);
}
