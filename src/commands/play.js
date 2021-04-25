const ytdl = require('ytdl-core')
const download = require('../functions/download')
const compileSongs = require('../functions/compileSongs')
const songControls = require('../utils/songControls')
const ytpl = require('ytpl');
const { isSpotifyPlaylist, getPlaylistID } = require('../utils/isSpotifyPlaylist')
const { getPlaylistTracks } = require('../utils/spotifyApi')
const yts = require('yt-search');

module.exports = {
  name: 'play',
  description: 'Plays a song or a playlist.',
  needsVoiceChannel: true,
  args: true,
  usage: '`#play childish gambino redbone` or \n`#play https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg`',
  execute(server, message, args) {
    const songs = args;

    server.joinChannel(message.member.voice.channel).then(connection => {
      if (songs.length === 1 && isSpotifyPlaylist(songs[0])) {
        getPlaylistTracks(getPlaylistID(songs[0])).then(songsResults => {
          const queueItems = server.queue.length
          songsResults.forEach(songData => {
            server.addSong({ name: `${songData.track.artists[0].name} - ${songData.track.name}` })
          })
          message.channel.send(`Added ${songsResults.length} songs to the queue.`);
          if (queueItems === 0 && !server.playing) {
            songControls.nextSong(server, message);
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
          if (queueItems === 0 && !server.playing) {
            songControls.nextSong(server, message);
          }
        })
      } else if (songs.length === 2 && ytpl.validateID(songs[0]) && ytpl.validateID(songs[1])) {
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
              if (server.queue.length === 0 && !server.playing) {
                server.addSong({ url: songPath });
                songControls.nextSong(server, message);
              } else {
                server.addSong({ url: songPath });
                message.channel.send("Song mixed and added to queue.");
              }
            }
          });
        })
      }
      else {
        const song = songs.join(' ')
        const queueItems = server.queue.length
        if (ytdl.validateURL(song)) {
          server.addSong({ url: song });
        } else {
          server.addSong({ name: song });
        }
        if (queueItems === 0 && !server.playing) {
          songControls.nextSong(server, message);
        } else {
          message.channel.send({
            embed: {
              color: "#a689e0",
              description: `Added \`${song}\` to the queue.`,
            }
          });
        }
      }
    })
  }
};
