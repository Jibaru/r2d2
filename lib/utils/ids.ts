import { nanoid } from "nanoid";

export function generateStationId(): string {
	return `station_${nanoid()}`;
}

export function generateTrackId(): string {
	return `track_${nanoid()}`;
}
