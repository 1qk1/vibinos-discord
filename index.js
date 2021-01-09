require("dotenv").config();

const client = require('./utils/client');
const playHandler = require('./caseHandlers/play');
const stopHandler = require('./caseHandlers/stop');
const {state} = require('./utils/servers');

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
  const msg = message.content.split(" ");
  if (!state.get(message.guild.id)) {
    state.add(message.guild.id, {channel: message.member.voice.channel});
  }
  const server = state.get(message.guild.id);
  switch (msg[0]) {
    case "#play": {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      playHandler(server, message, msg);
      break;
    }
    case "#stop": {
      if (!message.member.voice.channel) {
        return message.channel.send(
          "You must be in a channel to play the bot."
        );
      }
      stopHandler(server, msg);
      break;
    }
  }
});

client.login(process.env.TOKEN);
