const ytdl = require('ytdl-core');
const yts = require('yt-search');
const downloadNightcore = require('../functions/downloadNightcore')

const nextSong = (server, message) => {
  if (server.queue.length > 0) {
    let songIndex = 0
    if (server.shuffle) {
      songIndex = Math.floor(Math.random() * server.queue.length)
    }
    const song = server.queue[songIndex]
    server.queue.splice(songIndex, 1)
    playSong(server, message, song)
  } else {
    stopSongs(server)
    server.addTimer();
  }
}

const playSong = (server, message, song) => {
  server.stopTimer();
  server.dispatcher.end();
  const songPath = song.url
  server.playing = true
  if (song.name) {
    yts(song.name).then(results => {
      let dispatcher
      if (server.nightcore) {
        downloadNightcore(results.videos[0].url, (error, songPath) => {
          if (error) {
            message.channel.send(`There was an error executing this command. Continuing with the next song.`);
            return nextSong(server, message);
          }
          dispatcher = server.connection.play(songPath, { bitrate: 64 })
          message.channel.send(`Playing ${results.videos[0].url} in nightcore mode. Let's get funky.`);
          dispatcher.on("finish", () => {
            nextSong(server, message);
          });
        })
      } else {
        dispatcher = server.connection.play(ytdl(results.videos[0].url, { quality: 'highestaudio', highWaterMark: 1 << 25 }), { bitrate: 64 })
        message.channel.send(`Playing ${results.videos[0].url}. Let's get funky.`);
        dispatcher.on("finish", () => {
          nextSong(server, message);
        });
      }

      server.dispatcher = dispatcher
    })
  } else {
    let dispatcher
    if (ytdl.validateURL(songPath)) {
      if (server.nightcore) {
        downloadNightcore(songPath, (error, nightcorePath) => {
          dispatcher = server.connection.play(nightcorePath, { bitrate: 64 })
          message.channel.send(`Playing ${songPath} in nightcore mode. Let's get funky.`);
        })
      } else {
        dispatcher = server.connection.play(ytdl(songPath, { quality: 'highestaudio', highWaterMark: 1 << 25 }), { bitrate: 64 })
        message.channel.send(`Playing ${song.url}. Let's get funky.`);
      }
    } else {
      dispatcher = server.connection.play(songPath, { bitrate: 64 })
    }
    dispatcher.on("finish", () => {
      nextSong(server, message);
    });

    server.dispatcher = dispatcher
  }
}

const stopSongs = (server) => {
  // clear queue
  // clear convertQueue queue
  if (server.dispatcher) {
    server.queue = [];
    server.fullPlaylist = [];
    server.dispatcher.end();
    server.convertQueue = [];
    server.playing = false;
  }
}

module.exports = {
  playSong,
  nextSong,
  stopSongs
}