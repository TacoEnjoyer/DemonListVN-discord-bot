import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands: any[] = [];
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(
	(file) => file.endsWith('.ts') || file.endsWith('.js')
);

for (const file of commandFiles) {
	const filePath = join(commandsPath, file);
	const fileUrl = pathToFileURL(filePath).href;
	const command = await import(fileUrl);
	if ('data' in command && 'execute' in command) {
		commands.push(command.data.toJSON());
	}
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
	try {
		const isGuildDeploy = !!process.env.TEST_GUILD_ID;
		const route = process.env.TEST_GUILD_ID
			? Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.TEST_GUILD_ID)
			: Routes.applicationCommands(process.env.CLIENT_ID!);

		console.log(
			`Clearing existing application (/) commands ${
				isGuildDeploy ? `from guild ${process.env.TEST_GUILD_ID}` : 'globally'
			}...`
		);
		
		await rest.put(route, { body: [] });

		console.log('Successfully cleared existing commands.');
		console.log(
			`Started refreshing ${commands.length} application (/) commands ${
				isGuildDeploy ? `to guild ${process.env.TEST_GUILD_ID}` : 'globally'
			}.`
		);

		const data = (await rest.put(route, {
			body: commands
		})) as any[];

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
