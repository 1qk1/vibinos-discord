const async = require('async');
const fs = require('fs');
const path = require('path');
const ytdl = require("ytdl-core");
 
const download = (songs, cb) => {
  // downloads songs and returns the file names
  const songPaths = []
  async.forEachOf(songs, (song, key, cb2) => {
    if (!ytdl.validateURL(song) && !ytdl.validateID(song)) {
      return cb2(`Song ${key + 1} is not a valid youtube song`);
    };
    const video = ytdl(song, {filter: "audio"});
    // Will be called when the download starts.
    // video.on('info', function (info) {
    //     console.log('Download started');
    //     console.log(info);
    // });
    const videoID = ytdl.getVideoID(song)
    const songPath = path.join(__dirname, `../downloads/${videoID}.mp3`);
    
    video.pipe(fs.createWriteStream(songPath));
    video.on('end', function(info) {
      songPaths.push(songPath);
      return cb2(null);
    });
    video.on('error', (error) => {
      return cb2(error);
    });
  }, (err) => {
    if (err) return cb(err);
    return cb(null, songPaths);
  })
}

// },function(err){
//   if(err)
//     return console.log(err);
//   console.log("Every thing is done,Here!!");
// })

module.exports = download