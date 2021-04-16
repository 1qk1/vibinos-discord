const ytdl = require('ytdl-core')
const download = require('../functions/download')
const compileSongs = require('../functions/compileSongs')
const botControls = require('../utils/botControls')
const songControls = require('../utils/songControls')
const ytpl = require('ytpl');
const { isSpotifyPlaylist, getPlaylistID } = require('../utils/isSpotifyPlaylist')
const yts = require('yt-search');
const { getPlaylistTracks } = require('../utils/spotifyApi')

const playHandler = (server, message, splitted) => {
  const songs = splitted;
  if (songs.length === 0) {
    return message.channel.send("Command usage: `#play childish gambino redbone` or `#play https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg`")
  }

  botControls.joinChannel(server, message.member.voice.channel).then(connection => {
    if (songs.length === 1 && isSpotifyPlaylist(songs[0])) {
      getPlaylistTracks(getPlaylistID(songs[0])).then(songsResults => {
        const queueItems = server.queue.length
        songsResults.forEach(songData => {
          server.addSong({ name: `${songData.track.artists[0].name} - ${songData.track.name}` })
        })
        message.channel.send(`Added ${songsResults.length} songs to the queue.`);
        if (queueItems === 0) {
          songControls.playSong(server, message);
          // message.channel.send(`Playing ${server.queue[0].name}. Let's get funky.`);
        }
      })
    } else if (songs.length === 1 && ytpl.validateID(songs[0])) {
      const playlistURL = songs[0]
      ytpl(playlistURL, {
        limit: Infinity
      }).then(res => {
        const playlist = res.items;
        // add them to the queue
        const queueItems = server.queue.length
        playlist.forEach(song => {
          server.addSong({ url: song.shortUrl });
        })
        message.channel.send(`Added ${playlist.length} songs to the queue.`);
        if (queueItems === 0) {
          songControls.playSong(server, message);
        }
      })
    } else if (songs.length === 1 && ytdl.validateURL(songs[0])) {
      const song = songs[0]
      const queueItems = server.queue.length
      server.addSong({ url: song });
      if (queueItems === 0) {
        songControls.playSong(server, message);
      }
    } else if (songs.length === 1 && !ytdl.validateURL(songs[0])) {
      if (!process.env.YOUTUBE_KEY) return message.channel.send("Please enter a youtube API key to use this functionality.");
      // if it's not a youtube link
      yts(songs[0].replace(' ', ',')).then(results => {
        server.addConvert([results.videos[0].url]);
        download(server.convertQueue[0], (error, songPaths) => {
          if (error) {
            return message.channel.send(error);
          }
          // play the final file
          server.convertFinished();
          if (server.queue.length == 0) {
            server.addSong({ url: songPaths[0] });
            songControls.playSong(server, message);
          } else {
            server.addSong({ url: songPaths[0] });
            message.channel.send("Song mixed and added to queue.");
          }
          message.channel.send(`Playing ${results.videos[0].url}. Let's get funky.`);
        })
      });
    } else {
      // download the files
      server.addConvert(songs);
      download(server.convertQueue[0], (error, songPaths) => {
        if (error) {
          return message.channel.send(error);
        }
        // compile them together
        compileSongs(songPaths, (error, songPath) => {
          if (error) {
            // console.log(error)
            return message.channel.send("There was an error and couldn't play the song.");
          } else {
            // play the final file
            server.convertFinished();
            if (server.queue.length == 0) {
              server.addSong({ url: songPath });
              songControls.playSong(server, message);
            } else {
              server.addSong({ url: songPath });
              message.channel.send("Song mixed and added to queue.");
            }
          }
        });
      })
    }
  })
}

module.exports = playHandler