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

export interface Submission {
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

export async function getPlayerSubmissions(uid: string): Promise<Submission[]> {
	const response = await fetch(`${process.env.API_URL}/players/${uid}/submissions`);

	if (!response.ok) {
		throw new Error(`Failed to fetch submissions: ${response.statusText}`);
	}

	const submissions = (await response.json()) as Submission[];

	return submissions;
}

export function getMostRecentSubmission(submissions: Submission[]): Submission | null {
	return submissions[0] ?? null;
}
