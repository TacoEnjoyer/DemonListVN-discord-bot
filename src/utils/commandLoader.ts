import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Command {
  data: {
    name: string;
    description: string;
    toJSON: () => any;
  };
  execute: (interaction: any) => Promise<void>;
}

export async function loadCommands() {
  const commands = new Collection<string, Command>();
  const commandsPath = join(__dirname, '../commands');
  const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const fileUrl = pathToFileURL(filePath).href;
    const command = await import(fileUrl) as Command;
    
    if ('data' in command && 'execute' in command) {
      commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.log(`⚠️ The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }

  return commands;
}
