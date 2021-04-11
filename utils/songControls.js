const ytdl = require('ytdl-core');

const nextSong = (server) => {
  if (server.queue.length > 1) {
    server.queue = server.queue.slice(1)
    playSong(server)
  } else {
    stopSongs(server)
  }
}

const playSong = (server) => {
  const songPath = server.queue[0]
  let dispatcher
  if (ytdl.validateURL(songPath)) {
    dispatcher = server.connection.play(ytdl(songPath, { filter: 'audioonly' }))
  } else {
    dispatcher = server.connection.play(songPath)
  }
  dispatcher.on("finish", () => {
    nextSong(server);
  });
  server.dispatcher = dispatcher
}

const stopSongs = (server) => {
  // clear queue
  // clear convertQueue queue
  if (server.dispatcher) {
    server.queue = [];
    server.dispatcher.pause();
    server.convertQueue = [];
  }
}



module.exports = {
  playSong,
  nextSong,
  stopSongs
}