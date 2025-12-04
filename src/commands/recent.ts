import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../services/player.service';
import {
	getPlayerRecords,
	getMostRecentRecord,
	filterRecordsByType
} from '../services/record.service';

export const data = new SlashCommandBuilder()
	.setName('recent')
	.setDescription('Lấy bản ghi được chấp nhận mới nhất')
	.addUserOption((option) =>
		option.setName('user').setDescription('Người dùng để lấy bản ghi').setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName('list')
			.setDescription('Lọc theo list')
			.setRequired(false)
			.addChoices(
				{ name: 'Classic', value: 'dl' },
				{ name: 'Featured', value: 'fl' },
				{ name: 'Platformer', value: 'pl' }
			)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	try {
		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const player = await getPlayer(targetUser.id);

		if (!player) {
			await interaction.editReply({
				content: `Không tìm thấy tài khoản liên kết với ${targetUser.username}`
			});
			return;
		}

		const records = await getPlayerRecords(player.uid);

		const listType = interaction.options.getString('list') as 'dl' | 'fl' | 'pl' | null;

		let filteredRecords;

		if (listType) {
			filteredRecords = records[listType];
		} else {
			filteredRecords = [...records.dl, ...records.fl, ...records.pl];
			filteredRecords.sort((a, b) => b.timestamp - a.timestamp);
		}

		if (filteredRecords.length === 0) {
			await interaction.editReply({
				content: `${targetUser.username} không có bản ghi được chấp nhận`
			});
			return;
		}

		const mostRecent = getMostRecentRecord(filteredRecords);

		if (!mostRecent) {
			await interaction.editReply({
				content: `${targetUser.username} không có bản ghi được chấp nhận`
			});
			return;
		}

		const level = mostRecent.levels;
		const date = new Date(mostRecent.timestamp);
		const playerLink = `https://www.demonlistvn.com/player/${player.uid}`;
		const levelLink = `https://www.demonlistvn.com/level/${level.id}`;

		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`Bản ghi mới nhất của ${player.name}`)
			.setDescription(`**${level.name}** by ${level.creator}`)
			.addFields(
				{
					name: 'Điểm DL',
					value: mostRecent.dlPt !== null ? `${mostRecent.dlPt}` : 'N/A',
					inline: true
				},
				{
					name: 'Điểm FL',
					value: mostRecent.flPt !== null ? `${mostRecent.flPt}` : 'N/A',
					inline: true
				},
				{
					name: 'Điểm PL',
					value: mostRecent.plPt !== null ? `${mostRecent.plPt}` : 'N/A',
					inline: true
				},
				{ name: 'Tiến độ', value: `${mostRecent.progress}%`, inline: true },
				{ name: 'FPS', value: `${mostRecent.refreshRate}`, inline: true },
				{ name: 'Thiết bị', value: mostRecent.mobile ? 'Mobile' : 'PC', inline: true },
				{ name: 'Liên kết Video', value: `[Bấm vào đây](${mostRecent.videoLink})`, inline: false },
				{ name: 'Nộp lúc', value: date.toLocaleString(), inline: false },
				{ name: 'Level', value: `[${level.name}](${levelLink})`, inline: true },
				{ name: 'Người chơi', value: `[${player.name}](${playerLink})`, inline: true }
			);

		if (mostRecent.comment) {
			embed.addFields({ name: 'Bình luận', value: mostRecent.comment, inline: false });
		}

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error('Recent command error:', error);
		await interaction.editReply({
			content: 'Có lỗi xảy ra'
		});
	}
}
