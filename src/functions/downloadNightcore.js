const path = require('path');
const { exec } = require("child_process");
const { nanoid } = require('nanoid');
const ytdl = require("ytdl-core");
const fs = require('fs');
const { getYoutubeURL } = require('../utils/youtube')
const ffmpeg = require('fluent-ffmpeg')


const downloadNightcore = (songURL, cb) => {
  const songID = ytdl.getVideoID(songURL)
  const songPath = path.join(__dirname, '../nightcore', `${songID}.mp3`)
  // if (fs.existsSync(songPath)) {
  //   return cb(null, songPath)
  // }
  const stream = ytdl(songURL, { quality: 'highestaudio' })
  ffmpeg({ source: stream }).audioFilters(
    'asetrate=48000*1.21',
    'aresample=48000',
    'atempo=1/1.05',
    // 'bass=g=5'
  )
    .on('error', function (error) {
      return cb(error)
    })
    .on('end', function () {
      return cb(null, songPath)
    })
    .save(songPath);

}

module.exports = downloadNightcore
