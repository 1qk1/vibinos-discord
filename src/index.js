require("dotenv").config();

const client = require('./utils/client');
const playHandler = require('./caseHandlers/play');
const stopHandler = require('./caseHandlers/stop');
const skipHandler = require('./caseHandlers/skip');
const helpHandler = require('./caseHandlers/help');
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
  if (message.content[0] !== prefix) return;
  const cleaned = validator.blacklist(message.content, blacklistedChars)
  const action = cleaned.match(new RegExp(`\\${prefix}\\w+`, 'i'))[0]
  let splitted = cleaned.replace(`${action} `, '').replace(action, '').split(', ');
  if (splitted[0] === "") splitted = []
  // prefix +" " = action for switch statement
  // everything else = search terms
  // if search terms 
  if (!state.get(message.guild.id)) {
    state.add(message.guild.id);
  }
  const server = state.get(message.guild.id);
  server.channel = message.member.voice.channel;
  switch (action) {
    case `${prefix}play`: {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      playHandler(server, message, splitted);
      break;
    }
    case `${prefix}pause`: {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      playHandler(server, message, splitted);
      break;
    }
    case `${prefix}skip` || `${prefix}next`: {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      skipHandler(server, message);
      break;
    }
    case `${prefix}stop`: {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      stopHandler(server);
      break;
    }
    case `${prefix}join`: {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      message.channel.send("Coming.");
      server.joinChannel(message.member.voice.channel)
      break;
    }
    case `${prefix}leave`: {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      if (server.botChannel === null || server.botChannel.id !== message.member.voice.channel.id) {
        return message.channel.send("I'm not in your channel.");
      }
      stopHandler(server);
      message.channel.send("Bye bye.");
      server.leaveChannel(message.member.voice.channel);
      break;
    }
    case `${prefix}help`: {
      helpHandler(message);
      break;
    }
    case `${prefix}shuffle`: {
      server.toggleShuffle(message);
      break;
    }
    case `${prefix}sp`: {
      server.savePlaylist(splitted[0], message)
      break;
    }
    case `${prefix}pp`: {
      server.playPlaylist(splitted[0], message)
      break;
    }
    case `${prefix}playlists`: {
      server.showPlaylists(message)
      break;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
