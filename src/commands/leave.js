import songControls from '../utils/songControls.js'

export default {
  name: "leave",
  description: "Join the user's voice channel",
  needsVoiceChannel: true,
  execute(server, message) {
    if (server.botChannel && message.member.voice.channel.id === server.botChannel.id) {
      songControls.stopSongs(server);
      server.channel.send('Stopping all songs.');
      server.channel.send("Bye bye.");
      server.leaveChannel(message.member.voice.channel);
    } else {
      return server.channel.send("I'm not in your channel.");
    }
  }
};
