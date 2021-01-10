require("dotenv").config();

const client = require('./utils/client');
const playHandler = require('./caseHandlers/play');
const stopHandler = require('./caseHandlers/stop');
const skipHandler = require('./caseHandlers/skip');
const botControls = require('./utils/botControls');
const {state} = require('./utils/servers');

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  if (message.content[0] !== "#") return;
  const action = message.content.match(/#\w+/i)[0]
  const splitted = message.content.replace(`${action} `, '').split(', ');
  console.log(action, splitted)
  // #+" " = action for switch statement
  // everything else = search terms
  // if search terms 
  if (!state.get(message.guild.id)) {
    state.add(message.guild.id);
  }
  const server = state.get(message.guild.id);
  server.channel = message.member.voice.channel;
  switch (action) {
    case "#play": {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      playHandler(server, message, splitted);
      break;
    }
    case "#skip" || "#next": {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      skipHandler(server, message);
      break;
    }
    case "#stop": {
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
  }
});

client.login(process.env.DISCORD_TOKEN);
