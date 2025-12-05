import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../services/player.service';
import { getPlayerRecords } from '../services/record.service';

export const data = new SlashCommandBuilder()
	.setName('best')
	.setDescription('Lấy bản ghi tốt nhất của người chơi')
	.addStringOption((option) =>
		option
			.setName('list')
			.setDescription('Chọn list')
			.setRequired(true)
			.addChoices(
				{ name: 'Classic', value: 'dl' },
				{ name: 'Featured', value: 'fl' },
				{ name: 'Platformer', value: 'pl' }
			)
	)
	.addUserOption((option) =>
		option.setName('user').setDescription('Người dùng để lấy bản ghi').setRequired(false)
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
		const listType = interaction.options.getString('list', true) as 'dl' | 'fl' | 'pl';
		const filteredRecords = records[listType];

		if (!filteredRecords || filteredRecords.length === 0) {
			await interaction.editReply({
				content: `Không tìm thấy bản ghi nào trong list ${listType.toUpperCase()}`
			});
			return;
		}

		const bestRecord = filteredRecords[0];
		const formatTime = (ms: number) => {
			const minutes = Math.floor(ms / 60000);
			const seconds = Math.floor((ms % 60000) / 1000);
			const milliseconds = ms % 1000;
			return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
				.toString()
				.padStart(3, '0')}`;
		};

		const level = bestRecord.levels;
		const date = new Date(bestRecord.timestamp);
		const playerLink = `https://www.demonlistvn.com/player/${player.uid}`;
		const levelLink = `https://www.demonlistvn.com/level/${level.id}`;

		const embed = new EmbedBuilder()
			.setColor(0xffd700)
			.setTitle(`Bản ghi tốt nhất của ${player.name}`)
			.setDescription(`**${level.name}** by ${level.creator}`)
			.addFields(
				{
					name: 'Điểm DL',
					value: bestRecord.dlPt !== null ? `${bestRecord.dlPt}` : 'N/A',
					inline: true
				},
				{
					name: 'Điểm FL',
					value: bestRecord.flPt !== null ? `${bestRecord.flPt}` : 'N/A',
					inline: true
				},
				{
					name: 'Điểm PL',
					value: bestRecord.plPt !== null ? `${bestRecord.plPt}` : 'N/A',
					inline: true
				},
				{
					name: level.isPlatformer ? 'Thời gian' : 'Tiến độ',
					value: level.isPlatformer ? formatTime(bestRecord.progress) : `${bestRecord.progress}%`,
					inline: true
				},
				{ name: 'FPS', value: `${bestRecord.refreshRate}`, inline: true },
				{ name: 'Thiết bị', value: bestRecord.mobile ? 'Mobile' : 'PC', inline: true },
				{ name: 'Liên kết Video', value: `[Bấm vào đây](${bestRecord.videoLink})`, inline: false },
				{ name: 'Nộp lúc', value: date.toLocaleString(), inline: false },
				{ name: 'Level', value: `[${level.name}](${levelLink})`, inline: true },
				{ name: 'Người chơi', value: `[${player.name}](${playerLink})`, inline: true }
			)
			.setThumbnail(`https://img.youtube.com/vi/${level.videoID}/0.jpg`);

		if (bestRecord.comment) {
			embed.addFields({ name: 'Bình luận', value: bestRecord.comment, inline: false });
		}

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error('Best command error:', error);
		await interaction.editReply('Có lỗi xảy ra');
	}
}
