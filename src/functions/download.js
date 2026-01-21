import async from 'async';
import fs from 'fs';
import path from 'path';
import ytdl from "ytdl-core";

const download = (songs, cb) => {
  // downloads songs and returns the file names
  const songPaths = []
  async.forEachOf(songs, (song, key, cb2) => {
    const videoID = ytdl.getVideoID(song)
    const songPath = path.join(__dirname, `../downloads/${videoID}.mp4`);
    if (fs.existsSync(songPath)) {
      songPaths.push(songPath);
      return cb2(null);
    }
    const video = ytdl(song, { filter: "audioonly", highWaterMark: 1 << 25 });

    video.pipe(fs.createWriteStream(songPath));
    video.on('end', function (info) {
      songPaths.push(songPath);
      video.destroy();
      return cb2(null);
    });
    video.on('error', (error) => {
      video.destroy();
      return cb2(error);
    });
  }, (err) => {
    if (err) return cb(err);
    return cb(null, songPaths);
  })
}

export default download