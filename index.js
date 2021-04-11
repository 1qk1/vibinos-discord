require("dotenv").config();

const client = require('./utils/client');
const playHandler = require('./caseHandlers/play');
const stopHandler = require('./caseHandlers/stop');
const skipHandler = require('./caseHandlers/skip');
const helpHandler = require('./caseHandlers/help');
const botControls = require('./utils/botControls');
const { state } = require('./utils/servers');

const prefix = "#";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${prefix}help and ${prefix}play`, { type: "LISTENING" });
});


client.on("message", message => {
  if (message.content[0] !== prefix) return;
  const action = message.content.match(new RegExp(`${prefix}\\w+`, 'i'))[0]
  let splitted = message.content.replace(`${action} `, '').replace(action, '').split(', ');
  if (splitted[0] === "") splitted = []
  // #+" " = action for switch statement
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
    case "#join": {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      message.channel.send("Coming.");
      botControls.joinChannel(server, message.member.voice.channel);
      break;
    }
    case "#leave": {
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
      botControls.leaveChannel(server, message.member.voice.channel);
      break;
    }
    case "#help": {
      helpHandler(message);
      break;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
