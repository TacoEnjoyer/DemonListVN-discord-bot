import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, Client, Collection } from 'discord.js';
import { Command } from '../utils/command-loader.js';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('Hiển thị danh sách các lệnh có sẵn');

const SUPPORTER_COMMANDS = ['list', 'leaderboard'];

export async function execute(interaction: ChatInputCommandInteraction) {
	const client = interaction.client as Client & { commands: Collection<string, Command> };
	const commands = client.commands;

	if (!commands || commands.size === 0) {
		await interaction.reply({
			content: 'Không có lệnh nào được tìm thấy.',
			ephemeral: true
		});
		return;
	}

	const embed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle('Danh sách lệnh')
		.setTimestamp();

	let visibleCommandCount = 0;

	commands.forEach((command: Command) => {
		const commandName = command.data.name;
		
		if (commandName === 'ping' || commandName == 'help') {
			return;
		}
		
		visibleCommandCount++;
		const commandDescription = command.data.description;
		const isSupporterOnly = SUPPORTER_COMMANDS.includes(commandName);
		const supporterBadge = isSupporterOnly ? ' 💎 **[Chỉ dành cho Supporter]**' : '';

		let optionsText = '';
		const commandData = command.data.toJSON();
		
		if (commandData.options && commandData.options.length > 0) {
			const options = commandData.options.map((opt: any) => {
				const required = opt.required ? '**[bắt buộc]**' : '[tùy chọn]';
				return `  • \`${opt.name}\`: ${opt.description} ${required}`;
			}).join('\n');
			optionsText = `\n${options}`;
		}

		embed.addFields({
			name: `/${commandName}${supporterBadge}`,
			value: `${commandDescription}${optionsText}`,
			inline: false
		});
	});

	embed.setFooter({
		text: `Tổng cộng ${visibleCommandCount} lệnh`
	});

	await interaction.reply({ embeds: [embed] });
}
