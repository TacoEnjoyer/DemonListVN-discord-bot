import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getPlayer } from '../services/player.service';
import { isActive } from '../utils/isActive';

export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription("Lấy hồ sơ của người dùng")
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Người dùng muốn xem hồ sơ')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction) {
	const targetUser = interaction.options.getUser('user') ?? interaction.user;
	const discordId = targetUser.id;

	try {
		const player = await getPlayer(discordId);

		if (!player) {
			await interaction.reply(`Không tìm thấy tài khoản liên kết với tài khoản Discord ${targetUser.username}`);
			return;
		}

		const playerLink = `https://www.demonlistvn.com/player/${player.uid}`;
		const clanLink = `https://www.demonlistvn.com/clan/${player.clan ? player.clan : 0}`;
		const borderColor = player.borderColor ? parseInt(player.borderColor.replace('#', ''), 16) : null;
		const avatarUrl = `https://cdn.demonlistvn.com/avatars/${player.uid}.${
			isActive(player.supporterUntil) && player.isAvatarGif ? 'gif' : 'jpg'
		}?version=${player.avatarVersion}`;
		const bannerUrl = `https://cdn.demonlistvn.com/banners/${player.uid}.${
			isActive(player.supporterUntil) && player.isAvatarGif ? 'gif' : 'jpg'
		}?version=${player.avatarVersion}`;

		const embed = new EmbedBuilder()
			.setColor(isActive(player.supporterUntil) && player.borderColor ? borderColor : 0x0099ff)
			.setTitle(`${player.name}`)
			.setURL(playerLink)
			.setDescription(`**Vị trí:** ${player.city}, ${player.province}`)
			.setThumbnail(avatarUrl)
			.addFields(
				{
					name: 'Classic',
					value: `${player.rating ?? 0} #${player.dlrank ?? 'N/A'}`,
					inline: true
				},
				{
					name: 'Platformer',
					value: `${player.plRating ?? 0} #${player.plrank ?? 'N/A'}`,
					inline: true
				},
				{
					name: 'Featured',
					value: `${player.totalFLpt ?? 0} #${player.flrank ?? 'N/A'}`,
					inline: true
				},
			{ name: 'Số bản ghi', value: `${player.recordCount}`, inline: true },
			{ name: 'EXP', value: `${player.exp}`, inline: true },
			{ name: 'Hội', value: player.clans?.tag ? `[${player.clans.tag}](${clanLink})` : 'N/a', inline: true }
			)

		if (isActive(player.supporterUntil)) {
			embed.setImage(bannerUrl);
		}

		await interaction.reply({ embeds: [embed] });
	} catch (error) {
		console.error('Error fetching player profile:', error);
		await interaction.reply('Failed to fetch profile. Please try again later.');
	}
}
