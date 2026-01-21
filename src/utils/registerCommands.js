import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Function to get slash command definitions
export const getSlashCommands = () => {
  const slashCommandDefinitions = {
    'play': new SlashCommandBuilder()
      .setName('play')
      .setDescription('Play a song from YouTube or Spotify')
      .addStringOption(option =>
        option.setName('query')
          .setDescription('Song name, YouTube URL, or Spotify URL')
          .setRequired(true)),

    'skip': new SlashCommandBuilder()
      .setName('skip')
      .setDescription('Skip the current song'),

    'stop': new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Stop playback and clear the queue'),

    'pause': new SlashCommandBuilder()
      .setName('pause')
      .setDescription('Pause the current song'),

    'resume': new SlashCommandBuilder()
      .setName('resume')
      .setDescription('Resume playback'),

    'queue': new SlashCommandBuilder()
      .setName('queue')
      .setDescription('Show the current queue'),

    'shuffle': new SlashCommandBuilder()
      .setName('shuffle')
      .setDescription('Shuffle the queue'),

    'repeat': new SlashCommandBuilder()
      .setName('repeat')
      .setDescription('Toggle repeat mode')
      .addStringOption(option =>
        option.setName('mode')
          .setDescription('Repeat mode')
          .addChoices(
            { name: 'Off', value: 'off' },
            { name: 'One', value: 'one' },
            { name: 'All', value: 'all' }
          )),

    'help': new SlashCommandBuilder()
      .setName('help')
      .setDescription('Show all available commands'),

    'join': new SlashCommandBuilder()
      .setName('join')
      .setDescription('Join your voice channel'),

    'leave': new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Leave the voice channel'),

    'np': new SlashCommandBuilder()
      .setName('np')
      .setDescription('Show now playing information'),

    'quality': new SlashCommandBuilder()
      .setName('quality')
      .setDescription('Set audio quality')
      .addStringOption(option =>
        option.setName('bitrate')
          .setDescription('Audio quality in kbps')
          .addChoices(
            { name: '64 kbps', value: '64' },
            { name: '128 kbps', value: '128' },
            { name: '192 kbps', value: '192' },
            { name: '256 kbps', value: '256' }
          )),
  };

  return Object.values(slashCommandDefinitions).map(cmd => cmd.toJSON());
};

// Function to register commands for a specific guild
export const registerGuildCommands = async (guildId) => {
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    const slashCommands = getSlashCommands();

    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guildId),
      { body: slashCommands }
    );

    console.log(`✅ Registered ${slashCommands.length} slash commands for guild: ${guildId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to register commands for guild ${guildId}:`, error.message);
    return false;
  }
};

// Main registration function - only registers slash commands with Discord API
const registerCommands = async () => {
  console.log('Starting slash command registration...');

  // Try global registration first
  const slashCommands = getSlashCommands();
  if (slashCommands.length > 0) {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
      console.log(`Attempting to register ${slashCommands.length} slash commands globally...`);

      try {
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: slashCommands });
        console.log('✅ Successfully registered slash commands globally.');
      } catch (globalError) {
        console.log('⚠ Could not register slash commands globally:', globalError.message);
        console.log('This is normal if the bot lacks global command permissions.');
        console.log('Slash commands will be registered per-guild when the bot joins a server.');

        // Try to register for a test guild if specified
        if (process.env.TEST_GUILD_ID) {
          await registerGuildCommands(process.env.TEST_GUILD_ID);
        }
      }
    } catch (error) {
      console.error('Unexpected error during command registration:', error);
    }
  }

  console.log('Slash command registration complete. Message commands are loaded separately.');
}

export default registerCommands;