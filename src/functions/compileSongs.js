import path from 'path';
import { exec } from "child_process";
import fs from 'fs';
import { getYoutubeURL } from '../utils/youtube/youtube.js';

const compileSongs = (songPaths, cb) => {
  const songID = songPaths.map(song => getYoutubeURL(song)).join('')
  const songPath = path.join(__dirname, '../mixed', `${songID}.mp3`)
  if (fs.existsSync(songPath)) {
    return cb(null, songPath)
  }
  exec(`ffmpeg ${songPaths.map(path => `-i ${path}`).join(' ')} -filter_complex amerge=inputs=${songPaths.length} -ac ${songPaths.length} ${songPath}`, (error, stdout, stderr) => {
    if (error) {
      return cb(error.message);
    }
    return cb(null, songPath)
  });
}

export default compileSongs
