const { getVideoDurationInSeconds } = require('get-video-duration');

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
  const dispatcher = server.connection.play(songPath);
  server.dispatcher = dispatcher
  getVideoDurationInSeconds(songPath).then((duration) => {
    server.timeout = setTimeout(() => {
      nextSong(server);
    }, (duration * 1000) + 2000)
  }).catch(error => {
    console.log(error)
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