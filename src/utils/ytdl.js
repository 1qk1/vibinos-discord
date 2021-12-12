const dytdl = require('discord-ytdl-core');
const songControls = require('./songControls')

module.exports = (input, server) => {
  return dytdl(input, {
    filter: "audioonly",
    opusEncoded: true,
    highWaterMark: 1 << 25
  }).on('error', (error) => {
    server.channel.send(`There was an error while playing this song.`);
    // songControls.nextSong(server);
    console.log(error)
  })
}