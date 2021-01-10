const mp3Duration = require('mp3-duration');

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
  console.log(songPath)
  const dispatcher = server.connection.play(songPath);
  server.dispatcher = dispatcher
  mp3Duration(songPath, function (err, duration) {
    if (err) return console.log(err.message);
    server.timeout = setTimeout(() => {
      nextSong(server);
    }, (duration * 1000) + 2000)
  });
}

const stopSongs = (server) => {
  // clear queue
  // clear convertQueue queue
  if (server.dispatcher) {
    server.queue = [];
    clearTimeout(server.timeout);
    server.timeout = null;
    server.dispatcher.pause();
    server.convertQueue = [];
  }
}



module.exports = {
  playSong,
  nextSong,
  stopSongs
}