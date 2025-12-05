import {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType
} from 'discord.js';
import { fetchList, Level } from '../services/level.service';
import { checkSupporter } from '../utils/checkSupporter';

const LEVELS_PER_PAGE = 5;

export const data = new SlashCommandBuilder()
	.setName('list')
	.setDescription('Lấy level trong list, sắp xếp theo top')
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
	levels: Level[],
	page: number,
	totalLevels: number,
	listType: string
): EmbedBuilder {
	const listNames: { [key: string]: string } = {
		dl: 'Classic List',
		fl: 'Featured List',
		pl: 'Platformer List'
	};

	const embed = new EmbedBuilder()
		.setTitle(listNames[listType])
		.setColor(0x00ff00)
		.setFooter({ text: `Trang ${page + 1} | Tổng: ${levels.length} levels` });

	levels.forEach((level, index) => {
		const top = listType === 'dl' ? level.dlTop : listType === 'fl' ? level.flTop : level.dlTop;

		embed.addFields({
			name: `#${top} - ${level.name}`,
			value: `by ${level.creator} | Rating: ${level.rating}\n[Xem Level](https://www.demonlistvn.com/level/${level.id})`,
			inline: false
		});
	});

	return embed;
}

function createButtons(page: number, hasMore: boolean): ActionRowBuilder<ButtonBuilder> {
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
			.setDisabled(!hasMore)
	);
}

export async function execute(interaction: ChatInputCommandInteraction) {
	const listType = interaction.options.getString('list', true);
	const startPage = (interaction.options.getInteger('page') || 1) - 1;
	let currentPage = Math.max(0, startPage);

	try {
		await interaction.deferReply();
		await checkSupporter(interaction.user.id);

		let levels = await fetchList(
			listType,
			currentPage * LEVELS_PER_PAGE,
			(currentPage + 1) * LEVELS_PER_PAGE - 1
		);

		if (!levels || levels.length === 0) {
			await interaction.editReply('No levels found.');
			return;
		}

		const nextPageLevels = await fetchList(
			listType,
			(currentPage + 1) * LEVELS_PER_PAGE,
			(currentPage + 2) * LEVELS_PER_PAGE - 1
		);
		let hasMore = nextPageLevels.length > 0;

		const embed = createEmbed(levels, currentPage, 0, listType);
		const buttons = createButtons(currentPage, hasMore);

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

			levels = await fetchList(
				listType,
				currentPage * LEVELS_PER_PAGE,
				(currentPage + 1) * LEVELS_PER_PAGE - 1
			);

			const nextCheck = await fetchList(
				listType,
				(currentPage + 1) * LEVELS_PER_PAGE,
				(currentPage + 2) * LEVELS_PER_PAGE - 1
			);

			hasMore = nextCheck.length > 0;

			const newEmbed = createEmbed(levels, currentPage, 0, listType);
			const newButtons = createButtons(currentPage, hasMore);

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
		console.error('List command error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy danh sách';
		await interaction.editReply(errorMessage);
	}
}
