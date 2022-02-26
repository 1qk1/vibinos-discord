const songControls = require('../utils/songControls')
const timeoutActions = require('../utils/timeoutActions')

module.exports = {
  name: 'stop',
  timeoutAction: timeoutActions.TIMEOUT_START,
  description: 'Stops all playing songs.',
  needsVoiceChannel: true,
  execute(server, message) {
    return songControls.stopSongs(server);
  }
};
