const dytdl = require('discord-ytdl-core');
const songControls = require('./songControls')

module.exports = (input, server) => {
  return dytdl(input, {
    filter: "audioonly",
    opusEncoded: true,
  }).on('error', (error) => {
    server.channel.send(`There was an error while playing this song, continuing to the next one.`);
    songControls.nextSong(server);
    console.log(error)
  })
}