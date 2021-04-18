const path = require('path');
const { exec } = require("child_process");
const { nanoid } = require('nanoid');

const compileSongs = (songPaths, cb) => {
  const songID = nanoid()
  const songPath = path.join(__dirname, '../mixed', `${songID}.mp3`)
  exec(`ffmpeg ${songPaths.map(path => `-i ${path}`).join(' ')} -filter_complex amerge=inputs=${songPaths.length} -ac ${songPaths.length} ${songPath}`, (error, stdout, stderr) => {
    if (error) {
      return cb(error.message);
    }
    return cb(null, songPath)
  });
}

module.exports = compileSongs
