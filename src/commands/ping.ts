import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong and shows latency');

export async function execute(interaction: ChatInputCommandInteraction) {
  const sent = await interaction.reply({ content: 'Pong! 🏓', fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  
  await interaction.editReply(
    `Pong! 🏓\nLatency: ${latency}ms\nAPI Latency: ${Math.round(interaction.client.ws.ping)}ms`
  );
}
