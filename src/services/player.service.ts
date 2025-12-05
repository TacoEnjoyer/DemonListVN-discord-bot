export interface Player {
	id: number;
	name: string;
	email: string;
	facebook: string;
	youtube: string;
	discord: string;
	totalFLpt: number | null;
	totalDLpt: number | null;
	flrank: number | null;
	dlrank: number | null;
	uid: string;
	isAdmin: boolean;
	isBanned: boolean;
	isHidden: boolean;
	rating: number | null;
	dlMaxPt: number;
	flMaxPt: number;
	overallRank: number | null;
	province: string;
	city: string;
	isTrusted: boolean;
	reviewCooldown: string;
	renameCooldown: string;
	clan: number;
	recordCount: number;
	exp: number;
	extraExp: number;
	supporterUntil: string;
	isAvatarGif: boolean;
	isBannerGif: boolean;
	bgColor: string;
	borderColor: string;
	DiscordDMChannelID: string;
	avatarVersion: number;
	bannerVersion: number;
	plRating: number | null;
	plrank: number;
	nameLocked: boolean;
	elo: number;
	matchCount: number;
	pointercrate: string;
	overviewData: any;
	clans: {
		tag: string;
		name: string;
	};
}

interface SearchResponse {
	levels: any[];
	players: Player[];
}

export async function getPlayer(discordId: string): Promise<Player | null> {
	const response = await fetch(`${process.env.API_URL}/search/discord:${discordId}`);

	if (!response.ok) {
		throw new Error(`Failed to fetch player data: ${response.statusText}`);
	}

	const data = (await response.json()) as SearchResponse;

	if (!data.players || data.players.length === 0) {
		return null;
	}

	return data.players[0];
}

export async function fetchLeaderboard(listType: string): Promise<Player[]> {
	const response = await fetch(`https://api.demonlistvn.com/leaderboard/${listType}`);
	
	if (!response.ok) {
		throw new Error('Failed to fetch leaderboard data');
	}

	return (await response.json()) as Player[];
}
