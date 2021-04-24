const ytdl = require('ytdl-core');
const yts = require('yt-search');

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
  const songPath = song.url
  if (song.name) {
    yts(song.name).then(results => {
      dispatcher = server.connection.play(ytdl(results.videos[0].url, { filter: 'audioonly' }), { bitrate: 64 })
      message.channel.send(`Playing ${results.videos[0].url}. Let's get funky.`);
      dispatcher.on("finish", () => {
        nextSong(server, message);
      });
      server.dispatcher = dispatcher
    })
  } else {
    let dispatcher
    if (ytdl.validateURL(songPath)) {
      dispatcher = server.connection.play(ytdl(songPath, { filter: 'audioonly' }), { bitrate: 64 })
      message.channel.send(`Playing ${song.url}. Let's get funky.`);
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
  }
}

module.exports = {
  playSong,
  nextSong,
  stopSongs
}