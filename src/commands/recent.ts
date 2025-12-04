import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getPlayer } from '../services/player.service';
import { getPlayerRecords, getMostRecentRecord } from '../services/record.service';

export const data = new SlashCommandBuilder()
	.setName('recent')
	.setDescription('Show recently accepted records')
	.addUserOption((option) =>
		option.setName('user').setDescription('Discord user to check records for').setRequired(false)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	try {
		await interaction.deferReply();

		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const player = await getPlayer(targetUser.id);

		if (!player) {
			await interaction.editReply({
				content: `User ${targetUser.username} not found in DLVN database.`
			});
			return;
		}

		const acceptedRecords = await getPlayerRecords(player.uid);

		if (acceptedRecords.length === 0) {
			await interaction.editReply({
				content: `${targetUser.username} has no accepted records.`
			});
			return;
		}

		const mostRecent = getMostRecentRecord(acceptedRecords);

		if (!mostRecent) {
			await interaction.editReply({
				content: `${targetUser.username} has no accepted records.`
			});
			return;
		}

		const level = mostRecent.levels;
		const date = new Date(mostRecent.timestamp);
		const playerLink = `https://www.demonlistvn.com/player/${player.uid}`;
		const levelLink = `https://www.demonlistvn.com/level/${level.id}`;

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${player.name}'s recent record`)
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
			content: 'An error occurred while fetching the recent record.'
		});
	}
}
