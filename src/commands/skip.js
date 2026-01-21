import songControls from '../utils/songControls.js';

export default {
  name: 'skip',
  aliases: ['next'],
  description: 'Skips to next song.',
  needsVoiceChannel: true,
  execute(server, message) {
    if (server.botChannel && message.member.voice.channel.id === server.botChannel.id) {
      songControls.nextSong(server)
      return server.channel.send("Skipping song.");
    }
    return server.channel.send("I'm not in your channel.");
  }
};
