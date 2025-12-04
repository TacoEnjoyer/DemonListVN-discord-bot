import 'dotenv/config';

import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import { loadCommands, Command } from './utils/commandLoader.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
}) as Client & { commands: Collection<string, Command> };

client.commands = new Collection();

client.on(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);

  client.commands = await loadCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
