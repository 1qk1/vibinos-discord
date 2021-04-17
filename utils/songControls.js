const ytdl = require('ytdl-core');
const yts = require('yt-search');

const nextSong = (server, message) => {
  if (server.queue.length > 1) {
    server.queue = server.queue.slice(1)
    playSong(server, message)
  } else {
    stopSongs(server)
    server.addTimer();
  }
}

const playSong = (server, message) => {
  const song = server.queue[0]
  server.stopTimer();
  const songPath = song.url
  if (song.name) {
    yts(song.name).then(results => {
      dispatcher = server.connection.play(ytdl(results.videos[0].url, { filter: 'audioonly' }))
      message.channel.send(`Playing ${results.videos[0].url}. Let's get funky.`);
      dispatcher.on("finish", () => {
        nextSong(server, message);
      });
      server.dispatcher = dispatcher
    })
  } else {
    let dispatcher
    if (ytdl.validateURL(songPath)) {
      dispatcher = server.connection.play(ytdl(songPath, { filter: 'audioonly' }))
      message.channel.send(`Playing ${server.queue[0].url}. Let's get funky.`);
    } else {
      dispatcher = server.connection.play(songPath)
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
    server.dispatcher.pause();
    server.convertQueue = [];
  }
}



module.exports = {
  playSong,
  nextSong,
  stopSongs
}