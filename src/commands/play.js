const songControls = require('../utils/songControls')
const ytpl = require('ytpl');
const { isSpotifyPlaylist, getPlaylistID } = require('../utils/isSpotifyPlaylist')
const { getPlaylistTracks } = require('../utils/spotifyApi')
const { state } = require('../utils/servers')
const Song = require('../utils/song')
const Member = require('../utils/member')

module.exports = {
  name: 'play',
  description: `Plays a song from youtube or a playlist from youtube/spotify.`,
  needsVoiceChannel: true,
  autoJoin: true,
  args: true,
  usage: `\`${state.prefix}play childish gambino redbone\` or \n\`${state.prefix}play https://www.youtube.com/watch?v=0J2QdDbelmY\``,
  async execute(server, message, args) {
    const songs = args;
    const member = new Member({ name: message.member.displayName, member_id: message.member.id })
    if (songs.length === 1 && isSpotifyPlaylist(songs[0])) { // spotify playlist
      getPlaylistTracks(getPlaylistID(songs[0])).then(async songsResults => {
        songsResults.forEach(song => {
          if (song.track) {
            server.addSong(new Song({ name: `${song.track.artists[0].name} - ${song.track.name}`, addedBy: member }), false, false)
          }
        })
      })
    } else if (songs.length === 1 && ytpl.validateID(songs[0])) { //youtube playlist
      const playlistURL = songs[0]
      ytpl(playlistURL, {
        limit: Infinity
      }).then(async res => {
        const playlist = res.items;
        // add them to the queue
        playlist.forEach(song => server.addSong(new Song({ name: song.title, url: song.shortUrl, addedBy: member }), false))
        server.channel.send(`Added ${playlist.length} songs to the queue.`)
      })
    }
    else { //search youtube song by title
      const song = songs.join(' ')
      const queueItems = server.queue.length
      await server.addSong(new Song({ name: song, addedBy: member }));
      if (queueItems === 0 && !server.playing) {
        songControls.nextSong(server);
      }
    }
  }
};
