const ytdl = require('ytdl-core')
const download = require('../functions/download')
const youtubeSearch = require('youtube-search')
const compileSongs = require('../functions/compileSongs')
const botControls = require('../utils/botControls')
const songControls = require('../utils/songControls')

const playHandler = (server, message, splitted) => {
  const songs = splitted;
  botControls.joinChannel(server, message.member.voice.channel).then(connection => {
    if (songs.length == 1 && !ytdl.validateURL(songs[0])) {
      if (!process.env.YOUTUBE_KEY) return message.channel.send("Please enter a youtube API key to use this functionality.");
      // if it's not a youtube link
      const opts = {
        maxResults: 10,
        key: process.env.YOUTUBE_KEY
      };
      youtubeSearch(songs[0].replace(' ', ','), opts, (err, results) => {
        if(err) return console.log(err);
        server.addConvert([results[0].link]);
        download(server.convertQueue[0], (error, songPaths) => {
          if (error) {
            return message.channel.send(error);
          }
          // compile them together
              // play the final file
              server.convertFinished();
              if (server.queue.length == 0) {
                server.addSong(songPaths[0]);
                songControls.playSong(server);
                message.channel.send(`Playing ${results[0].link}. Let's get funky.`);
              } else {
                server.addSong(songPaths[0]);
                message.channel.send("Song mixed and added to queue.");
              }
        })
      });
    } else {
      // download the files
      server.addConvert(songs);
      download(server.convertQueue[0], (error, songPaths) => {
        if (error) {
          return message.channel.send(error);
        }
        // compile them together
        compileSongs(songPaths, (error, songPath) => {
          if (error) {
            // console.log(error)
            return message.channel.send("There was an error and couldn't play the song.");
          } else {
            // play the final file
            server.convertFinished();
            if (server.queue.length == 0) {
              server.addSong(songPath);
              songControls.playSong(server);
              message.channel.send("Let's get funky.");
            } else {
              server.addSong(songPath);
              message.channel.send("Song mixed and added to queue.");
            }
          }
        });
      })
    }
  })
}

module.exports = playHandler