const dytdl = require('discord-ytdl-core');
const ytdl = require('ytdl-core');
const myytdl = require('./ytdl');
const yts = require('yt-search');

const nextSong = (server) => {
  server.queueIndex++
  if (server.queue.length > server.queueIndex) {
    const song = server.queue[server.queueIndex]
    playSong(server, song)
  } else {
    stopSongs(server)
    server.addTimer();
  }
}

const playSong = (server, song) => {
  server.stopTimer();
  server.playing = true
  const filters = {
    nightcore: [
      ['-af', 'asetrate=48000*1.2,aresample=48000,atempo=1/1.05'],
      ['-af', 'asetrate=48000*1.3,aresample=48000,atempo=1/1.1'],
      ['-af', 'asetrate=48000*1.45,aresample=48000,atempo=1/1.2']
    ]
  }
  if (song.name && !song.url) {
    yts(song.name).then(results => {
      let dispatcher
      if (server.nightcore) {
        const stream = myytdl(results.videos[0].url, server, { encoderArgs: filters.nightcore[server.nightcore - 1], fmt: "mp3", opusEncoded: false })
        dispatcher = server.connection.play(stream, { bitrate: server.quality || 64 })
        server.channel.send(`Playing **\`${results.videos[0].title}\`** in nightcore mode. Let's get funky.`);
      } else {
        // console.log(results.videos[0])
        dispatcher = server.connection.play(myytdl(results.videos[0].url, server), { bitrate: server.quality || 64, type: "opus" })
        server.channel.send(`Playing **\`${results.videos[0].title}\`**. Let's get funky.`);
      }
      dispatcher.on("finish", () => {
        nextSong(server);
      });

      server.dispatcher = dispatcher
      server.dispatcher.on('error', console.error);
    })
  } else {
    let dispatcher
    if (ytdl.validateURL(song.url)) {
      if (server.nightcore) {
        const stream = myytdl(song.url, server, { encoderArgs: filters.nightcore[server.nightcore - 1], fmt: "mp3", opusEncoded: false })
        dispatcher = server.connection.play(stream, { bitrate: server.quality || 64 })
        server.channel.send(`Playing **\`${song.name}\`** in nightcore mode. Let's get funky.`);
      } else {
        dispatcher = server.connection.play(myytdl(song.url, server), { bitrate: server.quality || 64, type: "opus" })
      }
    } else {
      dispatcher = server.connection.play(song.url, { bitrate: server.quality || 64 })
    }
    dispatcher.on("finish", () => {
      nextSong(server);
    });

    server.dispatcher = dispatcher
    server.dispatcher.on('error', console.error);
  }
}

const stopSongs = (server) => {
  // clear queue
  // clear convertQueue queue
  if (server.dispatcher) {
    server.queue = [];
    server.dispatcher.end();
    server.convertQueue = [];
    server.playing = false;
    server.queueIndex = -1
  }
}

module.exports = {
  playSong,
  nextSong,
  stopSongs
}