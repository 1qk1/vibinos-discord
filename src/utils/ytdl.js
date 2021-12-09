const dytdl = require('discord-ytdl-core');
const ytdl = require('ytdl-core');


module.exports = (input) => {
  return dytdl(input, {
    filter: "audioonly",
    opusEncoded: true,
  })
}