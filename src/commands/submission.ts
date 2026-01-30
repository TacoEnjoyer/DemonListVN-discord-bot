import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../services/player.service';
import { getPlayerSubmissions } from '../services/submission.service';
import { formatTime } from '../utils/formatTime';
import { isActive } from '../utils/isActive';

export const data = new SlashCommandBuilder()
	.setName('submission')
	.setDescription('Lấy bản ghi được gửi gần đây nhất')
	.addUserOption((option) =>
		option.setName('user').setDescription('Người dùng để lấy bản ghi').setRequired(false)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	try {
		await interaction.deferReply();

		const targetUser = interaction.user;
		const player = await getPlayer(targetUser.id);

		if (!player) {
			await interaction.editReply({
				content: `Không tìm thấy tài khoản liên kết với ${targetUser.username}`
			});
			return;
		}

		const submissions = await getPlayerSubmissions(player.uid);
		const mostRecent = submissions[0] ?? null;

		if (!mostRecent) {
			await interaction.editReply({
				content: `${targetUser.username} không có bản ghi được gửi`
			});
			return;
		}

		const level = mostRecent.levels;
		const date = new Date(mostRecent.timestamp);
		const playerLink = `https://www.demonlistvn.com/player/${player.uid}`;
		const levelLink = `https://www.demonlistvn.com/level/${level.id}`;

		const isSupporter = isActive(player.supporterUntil);
		const queueValue = isSupporter && mostRecent.queueNo
			? `${mostRecent.queueNo}`
			: `[---](https://www.demonlistvn.com/supporter)`;

		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`Bản ghi được gửi gần đây của ${player.name}`)
			.setDescription(`**${level.name}** by ${level.creator}`)
			.setURL(levelLink)
			.addFields(
				{
					name: 'Tiến độ',
					value: `${mostRecent.progress}%`,
					inline: true
				},
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
					name: 'Ngày gửi',
					value: date.toLocaleDateString('vi-VN'),
					inline: true
				},
				{
					name: 'FPS',
					value: `${mostRecent.refreshRate}fps`,
					inline: true
				},
				{
					name: 'Mobile',
					value: mostRecent.mobile ? 'Có' : 'Không',
					inline: true
				},
				{
					name: 'Hàng đợi',
					value: queueValue,
					inline: true
				}
			);

		if (mostRecent.videoLink) {
			embed.addFields({
				name: 'Video',
				value: `[Youtube](${mostRecent.videoLink})`,
				inline: false
			});
		}

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error('Submission command error:', error);
		await interaction.editReply('Có lỗi xảy ra');
	}
}
