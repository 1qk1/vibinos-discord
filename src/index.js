require("dotenv-defaults").config();

const client = require('./utils/client');
const { state } = require('./utils/models/servers');
const validator = require('validator');
const mongoose = require('mongoose');
const Sentry = require("@sentry/node");
const timeoutActions = require('./utils/timeoutActions')

const blacklistedChars = '\\[\\\\;\'"\\]'

if (process.env.SENTRY_DSN && process.env.NODE_ENV.toLowerCase() === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}).then(() => {
  console.log('connected to database successfully')
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${state.prefix}help and ${state.prefix}play`, { type: "LISTENING" });
});
client.on("guildCreate", () => {
  client.user.setActivity(`${state.prefix}help and ${state.prefix}play`, { type: "LISTENING" });
});

client.on("message", async message => {
  if (!message.content.startsWith(state.prefix) || message.author.bot) return;

  const args = validator.blacklist(message.content.slice(state.prefix.length), blacklistedChars).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;
  if (command.guildOnly && message.channel.type !== 'text') return message.reply('I can\'t execute that command inside DMs!');
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) reply += `\nThe proper usage would be: \ ${command.usage}`;
    return message.channel.send(reply);
  }

  if (command.needsVoiceChannel && !message.member.voice.channel) {
    return message.channel.send(
      "You must be in a channel to use this command."
    );
  }

  if (!state.get(message.guild.id)) {
    state.add(message.guild.id);
  }
  const server = state.get(message.guild.id);
  server.channel = message.channel;
  try {
    if (command.autoJoin) {
      await server.joinChannel(message.member.voice.channel)
    }
    command.execute(server, message, args);
    if (command.timeoutAction) {
      switch (command.timeoutAction) {
        case timeoutActions.TIMEOUT_START:
          server.addTimer()
          break;
        case timeoutActions.TIMEOUT_STOP:
          server.removeTimer()
          break;
        default:
          break;
      }
    }
  } catch (error) {
    console.error(error);
    Sentry.captureException(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(process.env.DISCORD_TOKEN);
