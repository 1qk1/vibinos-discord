const path = require('path');
const { exec } = require("child_process");
const { nanoid } = require('nanoid');

const compileSongs = (songPaths, cb) => {
  const songID = nanoid()
  const songPath = path.join(__dirname, '../mixed', `${songID}.mp3`)
  exec(`ffmpeg -i ${songPaths[0]} -i ${songPaths[1]} -filter_complex amerge=inputs=2 -ac 2 ${songPath}`, (error, stdout, stderr) => {
      if (error) {
        return cb(error.message);
      }
      return cb(null, songPath)
  });
}

module.exports = compileSongs
