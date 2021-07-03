const ytdl = require('ytdl-core')
const download = require('../functions/download')
const compileSongs = require('../functions/compileSongs')
const songControls = require('../utils/songControls')
const ytpl = require('ytpl');
const { isSpotifyPlaylist, getPlaylistID } = require('../utils/isSpotifyPlaylist')
const { getPlaylistTracks } = require('../utils/spotifyApi')
const { state } = require('../utils/servers')
const yts = require('yt-search');

module.exports = {
  name: 'play',
  description: `Plays a mix if there are 2 youtube songs (\`${state.prefix}play https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg\`), a song or a playlist from youtube/spotify.`,
  needsVoiceChannel: true,
  args: true,
  usage: `\`${state.prefix}play childish gambino redbone\` or \n\`${state.prefix}play https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg\``,
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
