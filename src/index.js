require("dotenv").config();

const client = require('./utils/client');
const { state } = require('./utils/servers');
const validator = require('validator');
const mongoose = require('mongoose');


const blacklistedChars = '\\[\\\\;\'"\\]'

const prefix = process.env.PREFIX || "#";

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
  client.user.setActivity(`${prefix}help and ${prefix}play`, { type: "LISTENING" });
});

client.on("message", message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
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
  server.channel = message.member.voice.channel;

  try {
    command.execute(server, message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.login(process.env.DISCORD_TOKEN);
