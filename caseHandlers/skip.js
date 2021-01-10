const songControls = require('../utils/songControls')

const skipHandler = (server, message) => {
  songControls.nextSong(server)
  message.channel.send("Skipping song.");
}

module.exports = skipHandler