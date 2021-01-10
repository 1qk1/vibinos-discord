
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
  const dispatcher = server.connection.play(songPath).on("finish", () => {
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