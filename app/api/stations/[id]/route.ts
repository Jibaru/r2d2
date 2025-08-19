import { StationRepository } from "@/lib/repositories/stationRepository";
import type { NextRequest } from "next/server";

const stationRepo = new StationRepository();

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const stationData = await stationRepo.findById(params.id);

		if (!stationData) {
			return Response.json({ error: "Station not found" }, { status: 404 });
		}

		const station = stationRepo.toStationProfile(stationData);
		return Response.json(station);
	} catch (error) {
		console.error("Failed to fetch station:", error);
		return Response.json({ error: "Failed to fetch station" }, { status: 500 });
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const updates = await request.json();
		const updatedStation = await stationRepo.update(params.id, updates);

		if (!updatedStation) {
			return Response.json({ error: "Station not found" }, { status: 404 });
		}

		const station = stationRepo.toStationProfile(updatedStation);
		return Response.json(station);
	} catch (error) {
		console.error("Failed to update station:", error);
		return Response.json(
			{ error: "Failed to update station" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const deleted = await stationRepo.delete(params.id);

		if (!deleted) {
			return Response.json({ error: "Station not found" }, { status: 404 });
		}

		return Response.json({ success: true });
	} catch (error) {
		console.error("Failed to delete station:", error);
		return Response.json(
			{ error: "Failed to delete station" },
			{ status: 500 },
		);
	}
}
