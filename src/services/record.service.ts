interface Level {
	id: number;
	flPt: number | null;
	name: string;
	dlTop: number | null;
	flTop: number | null;
	rating: number;
	creator: string;
	videoID: string;
	accepted: boolean;
	isNonList: boolean;
	created_at: string;
	insaneTier: number | null;
	minProgress: number;
	isPlatformer: boolean;
}

export interface Record {
	videoLink: string;
	refreshRate: number;
	progress: number;
	timestamp: number;
	flPt: number | null;
	dlPt: number | null;
	userid: string;
	levelid: number;
	mobile: boolean;
	isChecked: boolean;
	comment: string;
	suggestedRating: number | null;
	reviewer: string | null;
	needMod: boolean;
	reviewerComment: string | null;
	no: number | null;
	raw: string;
	queueNo: number | null;
	plPt: number | null;
	levels: Level;
}

interface RecordsResponse {
	dl: Record[];
	fl: Record[];
	pl: Record[];
}

export async function getPlayerRecords(uid: string): Promise<Record[]> {
	try {
		const response = await fetch(`${process.env.API_URL}/players/${uid}/records`);

		if (!response.ok) {
			throw new Error(`Failed to fetch records: ${response.statusText}`);
		}

		const records = (await response.json()) as RecordsResponse;

		// Combine all records and filter for accepted ones, then sort by timestamp descending
		const allRecords = [...records.dl, ...records.fl, ...records.pl];
		const acceptedRecords = allRecords.filter((record) => record.levels.accepted);
		acceptedRecords.sort((a, b) => b.timestamp - a.timestamp);

		return acceptedRecords;
	} catch (error) {
		console.error('Record fetch error:', error);
		throw error;
	}
}

export function getMostRecentRecord(records: Record[]): Record | null {
	return records.length > 0 ? records[0] : null;
}