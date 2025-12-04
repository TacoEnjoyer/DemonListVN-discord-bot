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

export async function getPlayerRecords(uid: string): Promise<RecordsResponse> {
	try {
		const response = await fetch(`${process.env.API_URL}/players/${uid}/records`);

		if (!response.ok) {
			throw new Error(`Failed to fetch records: ${response.statusText}`);
		}

		const records = (await response.json()) as RecordsResponse;

		return records;
	} catch (error) {
		console.error('Record fetch error:', error);
		throw error;
	}
}

export function getMostRecentRecord(records: Record[]): Record | null {
	return records.length > 0 ? records[0] : null;
}

export function filterRecordsByType(records: Record[], type: 'dl' | 'fl' | 'pl'): Record[] {
	console.log(records);
	return records.filter((record) => {
		if (type === 'dl') {
			return record.levels.dlTop !== null;
		} else if (type === 'fl') {
			return record.levels.flTop !== null;
		} else if (type === 'pl') {
			return record.levels.isPlatformer;
		}

		return true;
	});
}
