import songControls from '../utils/songControls.js';
import ytpl from 'ytpl';
import { isSpotifyPlaylist, getPlaylistID } from '../utils/spotify/isSpotifyPlaylist.js';
import { getPlaylistTracks } from '../utils/spotify/spotifyApi.js';
import { state } from '../utils/models/servers.js';
import Song from '../utils/models/song.js';
import Member from '../utils/models/member.js';
import timeoutActions from '../utils/timeoutActions.js';

export default {
  name: 'play',
  description: `Plays a song from youtube or a playlist from youtube/spotify.`,
  needsVoiceChannel: true,
  autoJoin: true,
  args: true,
  timeoutAction: timeoutActions.TIMEOUT_STOP,
  usage: `\`${state.prefix}play childish gambino redbone\` or \n\`${state.prefix}play https://www.youtube.com/watch?v=0J2QdDbelmY\``,
  async execute(server, message, args) {
    const songs = args;
    const member = new Member({ name: message.member.displayName, member_id: message.member.id });

    // Debug: Check voice state
    console.log('Voice state debug:', {
      hasMember: !!message.member,
      hasVoice: !!message.member?.voice,
      voiceChannel: message.member?.voice?.channel,
      voiceChannelId: message.member?.voice?.channel?.id,
      voiceChannelType: message.member?.voice?.channel?.type,
      guildId: message.guild?.id
    });

    // Check if user is in a voice channel
    const voiceChannel = message.member?.voice?.channel;
    if (!voiceChannel) {
      return server.channel.send("You need to be in a voice channel to play music! Join a voice channel first, then use the command.");
    }

    // Debug the channel object
    console.log('Voice channel object:', {
      id: voiceChannel.id,
      name: voiceChannel.name,
      type: voiceChannel.type,
      joinExists: typeof voiceChannel.join === 'function',
      constructor: voiceChannel.constructor?.name
    });

    // Join voice channel if not already connected
    try {
      if (!server.connection || !server.botChannel || server.botChannel.id !== voiceChannel.id) {
        console.log(`Attempting to join voice channel: ${voiceChannel.name} (${voiceChannel.id})`);
        await server.joinChannel(voiceChannel);
        console.log(`Successfully joined voice channel: ${voiceChannel.name}`);
      } else {
        console.log(`Already in voice channel: ${voiceChannel.name}`);
      }
    } catch (error) {
      console.error('Error joining voice channel:', error);
      console.error('Full error details:', error.stack);
      return server.channel.send(`Failed to join your voice channel: ${error.message}`);
    }

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
      let songParams = { name: song }

      // Check if it's a URL (YouTube, SoundCloud, etc.)
      if (songs.length === 1) {
        const url = songs[0];
        // Simple URL detection for common audio sources
        const urlPatterns = [
          /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|shorts\/)?([a-zA-Z0-9_-]{11})/,
          /^(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/,
          /^(?:https?:\/\/)?(?:www\.)?spotify\.com\/(?:track|playlist|album)\/[a-zA-Z0-9]+/,
          /^(?:https?:\/\/)?(?:open\.spotify\.com)\/(?:track|playlist|album)\/[a-zA-Z0-9]+/,
          /^(?:https?:\/\/)?(?:www\.)?twitch\.tv\/[a-zA-Z0-9_]+/,
          /^(?:https?:\/\/)?(?:www\.)?bandcamp\.com\/track\/[a-zA-Z0-9_-]+/,
          /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/[0-9]+/
        ];

        if (urlPatterns.some(pattern => pattern.test(url))) {
          songParams = { url: song }
        }
      }

      const queueItems = server.queue.length
      await server.addSong(new Song({ ...songParams, addedBy: member }));
      if (queueItems === 0 && !server.playing) {
        songControls.nextSong(server);
      }
    }
  }
};
