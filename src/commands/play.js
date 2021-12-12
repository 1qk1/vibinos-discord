const songControls = require('../utils/songControls')
const ytpl = require('ytpl');
const { isSpotifyPlaylist, getPlaylistID } = require('../utils/isSpotifyPlaylist')
const { getPlaylistTracks } = require('../utils/spotifyApi')
const { state } = require('../utils/servers')
const Song = require('../utils/song')

module.exports = {
  name: 'play',
  description: `Plays a mix if there are 2 youtube songs (\`${state.prefix}play https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg\`), a song or a playlist from youtube/spotify.`,
  needsVoiceChannel: true,
  args: true,
  usage: `\`${state.prefix}play childish gambino redbone\` or \n\`${state.prefix}play https://www.youtube.com/watch?v=0J2QdDbelmY, https://www.youtube.com/watch?v=qeMFqkcPYcg\``,
  execute(server, message, args) {
    const songs = args;

    server.joinChannel(message.member.voice.channel).then(async connection => {
      if (songs.length === 1 && isSpotifyPlaylist(songs[0])) {
        getPlaylistTracks(getPlaylistID(songs[0])).then(async songsResults => {
          songsResults.forEach(song => {
            if (song.track) {
              server.addSong(new Song({ name: `${song.track.artists[0].name} - ${song.track.name}` }), null, false)
            }
          })
        })
      } else if (songs.length === 1 && ytpl.validateID(songs[0])) {
        const playlistURL = songs[0]
        ytpl(playlistURL, {
          limit: Infinity
        }).then(async res => {
          const playlist = res.items;
          // add them to the queue
          playlist.forEach(song => server.addSong(new Song({ name: song.title, url: song.shortUrl }), null, false))
          message.channel.send(`Added ${playlist.length} songs to the queue.`)
        })
      }
      else {
        const song = songs.join(' ')
        const queueItems = server.queue.length
        await server.addSong(song, message);
        if (queueItems === 0 && !server.playing) {
          songControls.nextSong(server, message);
        }
      }
    })
  }
};
