module.exports = {
  name: "join",
  description: "Join the user's voice channel",
  needsVoiceChannel: true,
  execute(server, message) {
    message.channel.send("Coming.");
    server.joinChannel(message.member.voice.channel)
  }
};
