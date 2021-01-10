const ytdl = require('ytdl-core')
const botControls = require('../utils/botControls')
const playFunctions = require('../functions/play');

const playHandler = (server, message, splitted) => {
  const songs = splitted;
  if (songs.length == 1 && !ytdl.validateURL(songs[0])) {
    playFunctions.playOne(server, message, songs)
  } else {
    // download the files
    playFunctions.playMany(server, message, songs)
  }
}

module.exports = playHandler