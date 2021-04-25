const songControls = require('../utils/songControls')

module.exports = {
  name: 'stop',
  description: 'Stops all playing songs.',
  needsVoiceChannel: true,
  execute(server, message) {
    return songControls.stopSongs(server);
  }
};
