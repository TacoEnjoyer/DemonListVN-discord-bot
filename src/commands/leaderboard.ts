import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType
} from 'discord.js';
import { checkSupporter } from '../utils/checkSupporter';
import { fetchLeaderboard, Player } from '../services/player.service';

const PLAYERS_PER_PAGE = 5;

export const data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Lấy bảng xếp hạng, sắp xếp theo top')
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
	.addIntegerOption((option) =>
		option
			.setName('page')
			.setDescription('Số trang (mặc định: 1)')
			.setRequired(false)
			.setMinValue(1)
	);

function createEmbed(
	players: Player[],
	page: number,
	totalPlayers: number,
	listType: string
): EmbedBuilder {
	const listNames: { [key: string]: string } = {
		dl: 'Classic Leaderboard',
		fl: 'Featured Leaderboard',
		pl: 'Platformer Leaderboard'
	};

	const rankField: { [key: string]: keyof Player } = {
		dl: 'dlrank',
		fl: 'flrank',
		pl: 'plrank'
	};

	const pointsField: { [key: string]: keyof Player } = {
		dl: 'totalDLpt',
		fl: 'totalFLpt',
		pl: 'plRating'
	};

	const embed = new EmbedBuilder()
		.setTitle(listNames[listType])
		.setColor(0x00ff00)
		.setFooter({ text: `Trang ${page + 1}` });

	players.forEach((player, index) => {
		const rank = page * PLAYERS_PER_PAGE + index + 1;
		const points = player[pointsField[listType]];
		const clanTag = player.clans?.tag ? `[${player.clans.tag}]` : '';
		
		embed.addFields({
			name: `#${rank} - ${clanTag} ${player.name}`,
			value: `Points: ${points ?? 'N/A'}\n[Xem hồ sơ](https://www.demonlistvn.com/player/${player.id})`,
			inline: false
		});
	});

	return embed;
}

function createButtons(page: number, totalPages: number): ActionRowBuilder<ButtonBuilder> {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId('prev')
			.setLabel('Previous')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(page === 0),
		new ButtonBuilder()
			.setCustomId('next')
			.setLabel('Next')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(page >= totalPages - 1)
	);
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const listType = interaction.options.getString('list', true);
	const startPage = (interaction.options.getInteger('page') || 1) - 1;
	let currentPage = Math.max(0, startPage);

	try {
		await interaction.deferReply();
		await checkSupporter(interaction.user.id);

		const allPlayers = await fetchLeaderboard(listType);

		if (!allPlayers || allPlayers.length === 0) {
			await interaction.editReply('No players found in this leaderboard.');
			return;
		}

		const totalPages = Math.ceil(allPlayers.length / PLAYERS_PER_PAGE);
		currentPage = Math.min(currentPage, totalPages - 1);

		let currentPlayers = allPlayers.slice(
			currentPage * PLAYERS_PER_PAGE,
			(currentPage + 1) * PLAYERS_PER_PAGE
		);

		const embed = createEmbed(currentPlayers, currentPage, allPlayers.length, listType);
		const buttons = createButtons(currentPage, totalPages);

		const response = await interaction.editReply({
			embeds: [embed],
			components: [buttons]
		});

		const collector = response.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 300000
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				await i.reply({ content: 'This is not your command!', ephemeral: true });
				return;
			}

			if (i.customId === 'next') {
				currentPage++;
			} else if (i.customId === 'prev') {
				currentPage--;
			}

			currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));

			currentPlayers = allPlayers.slice(
				currentPage * PLAYERS_PER_PAGE,
				(currentPage + 1) * PLAYERS_PER_PAGE
			);

			const newEmbed = createEmbed(currentPlayers, currentPage, allPlayers.length, listType);
			const newButtons = createButtons(currentPage, totalPages);

			await i.update({
				embeds: [newEmbed],
				components: [newButtons]
			});
		});

		collector.on('end', async () => {
			try {
				await interaction.editReply({ components: [] });
			} catch {}
		});
	} catch (error) {
		console.error('Leaderboard command error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy bảng xếp hạng';
		
		if (interaction.deferred) {
			await interaction.editReply(errorMessage);
		} else {
			await interaction.reply({ content: errorMessage, ephemeral: true });
		}
	}
}
