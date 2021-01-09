const songControls = require('../utils/songControls')

const stopHandler = (server) => {
  songControls.stopSongs(server);
  // server.channel.send('Stopping all songs.');
  return;
}

module.exports = stopHandler