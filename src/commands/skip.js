const songControls = require('../utils/songControls')

module.exports = {
  name: 'skip',
  aliases: ['next'],
  description: 'Skips to next song.',
  needsVoiceChannel: true,
  execute(server, message) {
    songControls.nextSong(server, message)
    return message.channel.send("Skipping song.");
  }
};
