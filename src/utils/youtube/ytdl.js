const dytdl = require('discord-ytdl-core');
const songControls = require('../songControls')
const Sentry = require("@sentry/node");

module.exports = (input, server, extraParams) => {
  return dytdl(input, {
    filter: "audioonly",
    opusEncoded: true,
    highWaterMark: 1 << 25,
    ...extraParams
  }).on('error', (error) => {
    server.channel.send(`There was an error while playing this song.`);
    // songControls.nextSong(server);
    Sentry.captureException(error);
    console.log(error)
  })
}