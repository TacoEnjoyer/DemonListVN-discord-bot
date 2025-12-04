import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { searchLevel } from '../services/search.service';

export const data = new SlashCommandBuilder()
	.setName('level')
	.setDescription('Lấy thông tin của một level')
	.addStringOption((option) =>
		option.setName('query').setDescription('Tên hoặc ID của level').setRequired(true)
	);

export async function execute(interaction: ChatInputCommandInteraction) {
	const query = interaction.options.getString('query', true);

	try {
		await interaction.deferReply();

		const result = await searchLevel(query);

		if (!result.levels || result.levels.length === 0) {
			await interaction.editReply('No level found.');
			return;
		}

		const level = result.levels[0];

		const embed = new EmbedBuilder()
			.setTitle(level.name)
			.setDescription(`by ${level.creator}`)
			.setURL(`https://www.demonlistvn.com/level/${level.id}`)
			.addFields(
				{ name: 'ID', value: level.id.toString(), inline: true },
				{
					name: level.isPlatformer ? 'Platformer' : 'Classic',
					value: `${level.rating} #${level.dlTop}`,
					inline: true
				},
				{ name: 'Featured', value: `${level.flPt} #${level.flTop}`, inline: true }
			)
			.setColor(0x00ff00);

		if (level.videoID) {
			embed.setThumbnail(`https://img.youtube.com/vi/${level.videoID}/0.jpg`);
		}

		await interaction.editReply({ embeds: [embed] });
	} catch (error) {
		console.error('Level command error:', error);
		await interaction.editReply('Có lỗi xảy ra');
	}
}
