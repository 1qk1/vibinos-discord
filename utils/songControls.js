const mp3Duration = require('mp3-duration');

const nextSong = (server) => {
  server.queue = server.queue.slice(1)
  playSong(server)
}

const playSong = (server) => {
  const songPath = server.queue[0]
  const dispatcher = server.connection.play(songPath);
  console.log(dispatcher)
  server.dispatcher = dispatcher
  console.log(server.dispatcher)
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
    server.dispatcher.pause();
    server.convertQueue = [];
  }
}



module.exports = {
  playSong,
  nextSong,
  stopSongs
}