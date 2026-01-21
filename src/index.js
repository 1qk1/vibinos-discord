import { config } from "dotenv-defaults";
config();
import client from './utils/client.js';
import { state } from './utils/models/servers.js';
import validator from 'validator';
import mongoose from 'mongoose';
import * as Sentry from "@sentry/node";
import timeoutActions from './utils/timeoutActions.js';
import registerCommands from './utils/registerCommands.js';
import { Events } from 'discord.js';

if (process.env.SENTRY_DSN && process.env.NODE_ENV.toLowerCase() === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

mongoose.connect(process.env.MONGO_URL, {
}).then(() => {
  console.log('connected to database successfully')
});

client.on(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${state.prefix}help and ${state.prefix}play`, { type: "LISTENING" });
  registerCommands().then(() => {
    console.log('Commands registered successfully');
  }).catch(error => {
    console.error('Error registering commands:', error);
  });
});

client.on(Events.GuildCreate, async (guild) => {
  client.user.setActivity(`${state.prefix}help and ${state.prefix}play`, { type: "LISTENING" });

  // Try to register slash commands for this guild
  try {
    const { registerGuildCommands } = await import('./utils/registerCommands.js');
    await registerGuildCommands(guild.id);
    console.log(`Slash commands registered for new guild: ${guild.name} (${guild.id})`);
  } catch (error) {
    console.log(`Could not register slash commands for guild ${guild.name}:`, error.message);
    console.log('Message commands will still work with prefix:', state.prefix);
  }
});

// Message command handling
client.on(Events.MessageCreate, async message => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Ignore messages without prefix
  if (!message.content.startsWith(state.prefix)) return;

  // Parse command and arguments
  const args = message.content.slice(state.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Get the command
  const command = client.commands?.get(commandName);

  if (!command) {
    // Command not found
    return;
  }

  try {
    // Get or create server state for this guild
    let server = state.get(message.guild.id);
    if (!server) {
      state.add(message.guild.id, { channel: message.channel });
      server = state.get(message.guild.id);
    }

    // Update server channel
    server.channel = message.channel;

    // Execute the command
    await command.execute(server, message, args);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    Sentry.captureException(error);

    // Send error message to user
    try {
      await message.reply(`There was an error executing that command: ${error.message}`);
    } catch (replyError) {
      console.error('Could not send error message:', replyError);
    }
  }
});

// Slash command handling
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;
  const command = client.commands?.get(commandName);

  if (!command) {
    await interaction.reply({ content: 'Command not found.', ephemeral: true });
    return;
  }

  try {
    // Get or create server state for this guild
    let server = state.get(interaction.guildId);
    if (!server) {
      state.add(interaction.guildId, { channel: interaction.channel });
      server = state.get(interaction.guildId);
    }

    // Update server channel
    server.channel = interaction.channel;

    // Get arguments from interaction options
    const args = [];

    // Handle different command types
    if (commandName === 'play') {
      const query = interaction.options.getString('query');
      if (query) {
        // Split by spaces to simulate message command args
        args.push(...query.split(' '));
      }
    } else if (commandName === 'repeat') {
      const mode = interaction.options.getString('mode') || 'off';
      args.push(mode);
    } else if (commandName === 'quality') {
      const bitrate = interaction.options.getString('bitrate') || '64';
      args.push(bitrate);
    }
    // For commands without options, args remains empty

    // Create a mock message object for compatibility with existing command structure
    const mockMessage = {
      guild: interaction.guild,
      channel: interaction.channel,
      member: interaction.member,
      author: interaction.user,
      reply: async (content) => {
        if (typeof content === 'string') {
          if (interaction.deferred) {
            await interaction.editReply({ content });
          } else {
            await interaction.reply({ content });
          }
        } else if (content && content.embeds) {
          if (interaction.deferred) {
            await interaction.editReply({ embeds: content.embeds });
          } else {
            await interaction.reply({ embeds: content.embeds });
          }
        } else {
          if (interaction.deferred) {
            await interaction.editReply({ content: 'Command executed.' });
          } else {
            await interaction.reply({ content: 'Command executed.' });
          }
        }
      },
      client: interaction.client
    };

    // Defer reply for commands that might take time (like play)
    const shouldDefer = ['play', 'mix', 'skip', 'stop', 'pause', 'resume'].includes(commandName);
    if (shouldDefer) {
      await interaction.deferReply();
    }

    // Execute the command
    await command.execute(server, mockMessage, args);

    // If the command didn't reply already and we deferred, send a default response
    if (shouldDefer && !interaction.replied) {
      await interaction.editReply('Command executed successfully.');
    }
  } catch (error) {
    console.error(`Error executing slash command ${commandName}:`, error);
    Sentry.captureException(error);

    try {
      const errorMessage = `There was an error executing that command: ${error.message}`;
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    } catch (replyError) {
      console.error('Could not send error message:', replyError);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
