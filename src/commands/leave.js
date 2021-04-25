const songControls = require('../utils/songControls')

module.exports = {
  name: "leave",
  description: "Join the user's voice channel",
  needsVoiceChannel: true,
  execute(server, message) {
    if (message.member.voice.channel.id === server.botChannel.id) {
      songControls.stopSongs(server);
      message.channel.send('Stopping all songs.');
      message.channel.send("Bye bye.");
      server.leaveChannel(message.member.voice.channel);
    } else {
      return message.channel.send("I'm not in your channel.");
    }
  }
};
