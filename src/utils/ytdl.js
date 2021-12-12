const dytdl = require('discord-ytdl-core');
const songControls = require('./songControls')

module.exports = (input, server, message) => {
  return dytdl(input, {
    filter: "audioonly",
    opusEncoded: true,
  }).on('error', (error) => {
    message.channel.send(`There was an error while playing this song, continuing to the next one.`);
    songControls.nextSong(server, message);
    console.log(error)
  })
}