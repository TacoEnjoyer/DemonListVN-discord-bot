interface Level {
	id: number;
	name: string;
	creator: string;
	videoID: string;
	minProgress: number;
	flTop: number | null;
	dlTop: number | null;
	flPt: number | null;
	rating: number;
	created_at: string;
	isPlatformer: boolean;
	insaneTier: number | null;
	accepted: boolean;
	isNonList: boolean;
}

interface SearchResponse {
	levels: Level[];
	players: any[];
}

export async function searchLevel(query: string) {
	try {
		const response = await fetch(`${process.env.API_URL}/search/${encodeURIComponent(query)}`);

		if (!response.ok) {
			throw new Error(`API error: ${response.status}`);
		}
		const data = (await response.json()) as SearchResponse;

		return data;
	} catch (error) {
		console.error('Search error:', error);
		
		throw error;
	}
}
