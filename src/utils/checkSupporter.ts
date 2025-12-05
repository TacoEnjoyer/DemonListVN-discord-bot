import { getPlayer } from '../services/player.service';
import { isActive } from './isActive';

export async function checkSupporter(discordId: string): Promise<void> {
	const player = await getPlayer(discordId);

	if (!player) {
		throw new Error('Bạn cần liên kết tài khoản trước khi sử dụng lệnh này.');
	}

	if (!isActive(player.supporterUntil)) {
		throw new Error('Lệnh này chỉ dành cho Supporter. [Mua tại đây](https://www.demonlistvn.com/supporter)');
	}
}
