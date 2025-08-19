import { StationRepository } from "@/lib/repositories/stationRepository";
import type { StationProfile } from "@/lib/types";
import type { NextRequest } from "next/server";

const stationRepo = new StationRepository();

export async function POST(request: NextRequest) {
	try {
		const stationProfile: StationProfile = await request.json();

		// Validate required fields
		if (
			!stationProfile.id ||
			!stationProfile.requiredGenres ||
			!stationProfile.selectedStyles
		) {
			return Response.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const savedStation = await stationRepo.create(stationProfile);
		const responseStation = await stationRepo.toStationProfile(savedStation);

		return Response.json(responseStation);
	} catch (error) {
		console.error("Failed to create station:", error);
		return Response.json(
			{ error: "Failed to create station" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = Number(searchParams.get("limit")) || 50;
		const offset = Number(searchParams.get("offset")) || 0;

		const stations = await stationRepo.list(limit, offset);
		const responseStations = await Promise.all(
			stations.map((station) => stationRepo.toStationProfile(station)),
		);

		return Response.json(responseStations);
	} catch (error) {
		console.error("Failed to fetch stations:", error);
		return Response.json(
			{ error: "Failed to fetch stations" },
			{ status: 500 },
		);
	}
}
