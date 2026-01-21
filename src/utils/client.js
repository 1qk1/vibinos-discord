import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { state } from './models/servers.js';
import ShoukakuManager from './audio/ShoukakuManager.js';
import * as songControls from './songControls.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
  allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});

// Initialize Shoukaku manager for Lavalink
let shoukakuManager;

// Load message commands when client is ready
client.once('ready', async () => {
  client.commands = new Collection();
  if (state) {
    state.client = client;
  }

  // Initialize Shoukaku manager
  try {
    shoukakuManager = new ShoukakuManager(client);
    client.shoukaku = shoukakuManager;
    console.log('✅ Shoukaku manager initialized');

    // Initialize song controls with Shoukaku manager
    if (songControls && songControls.initialize) {
      songControls.initialize(shoukakuManager);
    }
  } catch (error) {
    console.error('❌ Failed to initialize Shoukaku manager:', error);
  }

  const commandFiles = readdirSync(join(__dirname, '../', 'commands')).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const commandModule = await import(`file://${join(__dirname, '../', 'commands', file)}`);
      const command = commandModule.default || commandModule;

      if (command.name && command.execute) {
        client.commands.set(command.name, command);
        // Also register aliases
        if (command.aliases && Array.isArray(command.aliases)) {
          for (const alias of command.aliases) {
            client.commands.set(alias, command);
          }
        }
        console.log(`Loaded command: ${command.name}`);
      }
    } catch (error) {
      console.error(`Error loading command ${file}:`, error.message);
    }
  }

  console.log(`Loaded ${client.commands.size} command entries (including aliases)`);
});

// Handle voice state updates for automatic disconnection
client.on('voiceStateUpdate', async (oldState, newState) => {
  // If bot was disconnected from voice channel
  if (oldState.member?.id === client.user?.id && !newState.channelId) {
    const guildId = oldState.guild.id;
    if (shoukakuManager) {
      try {
        await shoukakuManager.destroyPlayer(guildId);
        console.log(`Disconnected from voice channel in guild ${guildId}`);
      } catch (error) {
        console.error(`Error destroying player for guild ${guildId}:`, error);
      }
    }
  }
});

export default client;