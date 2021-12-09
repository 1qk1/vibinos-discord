const dytdl = require('discord-ytdl-core');
const ytdl = require('ytdl-core');
const myytdl = require('./ytdl');
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
  server.playing = true
  const filters = {
    nightcore: [
      ['-af', 'asetrate=48000*1.2,aresample=48000,atempo=1/1.05'],
      ['-af', 'asetrate=48000*1.3,aresample=48000,atempo=1/1.1'],
      ['-af', 'asetrate=48000*1.45,aresample=48000,atempo=1/1.2']
    ]
  }
  if (song.name) {
    yts(song.name).then(results => {
      let dispatcher
      if (server.nightcore) {
        const stream = dytdl(results.videos[0].url, {
          filter: "audioonly",
          fmt: "mp3",
          encoderArgs: filters.nightcore[server.nightcore - 1]
        })
        dispatcher = server.connection.play(stream, { bitrate: server.quality || 64 })
        message.channel.send(`Playing ${results.videos[0].url} in nightcore mode. Let's get funky.`);
      } else {
        dispatcher = server.connection.play(myytdl(results.videos[0].url), { bitrate: server.quality || 64, type: "opus" })
        message.channel.send(`Playing ${results.videos[0].url}. Let's get funky.`);
      }
      dispatcher.on("finish", () => {
        nextSong(server, message);
      });

      server.dispatcher = dispatcher
    })
  } else {
    let dispatcher
    if (ytdl.validateURL(songPath)) {
      if (server.nightcore) {
        const stream = dytdl(results.videos[0].url, {
          filter: "audioonly",
          fmt: "mp3",
          encoderArgs: filters.nightcore[server.nightcore - 1]
        })
        dispatcher = server.connection.play(stream, { bitrate: server.quality || 64 })
        message.channel.send(`Playing ${results.videos[0].url} in nightcore mode. Let's get funky.`);
      } else {
        dispatcher = server.connection.play(myytdl(songPath), { bitrate: server.quality || 64, type: "opus" })
        message.channel.send(`Playing ${song.url}. Let's get funky.`);
      }
    } else {
      dispatcher = server.connection.play(songPath, { bitrate: server.quality || 64 })
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