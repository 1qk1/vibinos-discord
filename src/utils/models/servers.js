import Playlist from '../../models/playlist.js';
import Guild from '../../models/guild.js';
import songControls from '../songControls.js';
import fyShuffle from '../fisherYatesShuffle.js';
import { repeat as repeatStates } from '../variables.js';
import getYoutubeSong from '../youtube/getYT.js';
class Server {
  constructor({
    id,
    convertQueue = [],
    queue = [],
    queueIndex = -1,
    dispatcher = null,
    connection = null,
    channel = null,
    botChannel = null,
    timeOut = null,
    nightcore = false,
    repeat = repeatStates.REPEAT_OFF,
    quality = 64
  } = {}) {
    this.id = id
    this.convertQueue = convertQueue
    this.queue = queue
    this.queueIndex = queueIndex
    this.dispatcher = dispatcher
    this.connection = connection
    this.channel = channel
    this.botChannel = botChannel
    this.timeOut = timeOut
    this.nightcore = nightcore
    this.repeat = repeat
    this.playing = false
    this.quality = quality
    this.savePlaylist.bind(this)
    this.deletePlaylist.bind(this)
    this.playPlaylist.bind(this)
  }
  async addSong(song, sendMessage = true, searchYoutube = true) {
    try {
      let songToAdd = song;
      if (searchYoutube) {
        songToAdd = await getYoutubeSong(song);
      }

      this.queue.push(songToAdd);
      const songNotPlaying = this.queue.length > 0 && this.queue.length >= this.queueIndex && !this.playing;

      if (songNotPlaying) {
        songControls.nextSong(this);
      }

      if (sendMessage && this.channel) {
        if (songNotPlaying) {
          this.channel.send(`Playing **${songToAdd.name}**. Let's get funky.`);
        } else {
          this.channel.send(`Added **\`${songToAdd.name}\`** to the queue. (Position: ${this.queue.length})`);
        }
      }

      // Limit queue size to prevent memory issues
      const MAX_QUEUE_SIZE = 100;
      if (this.queue.length > MAX_QUEUE_SIZE) {
        const removed = this.queue.splice(0, this.queue.length - MAX_QUEUE_SIZE);
        if (this.channel) {
          this.channel.send(`Queue limit reached (${MAX_QUEUE_SIZE}). Removed ${removed.length} oldest songs.`);
        }
      }

      return this.queue;
    } catch (error) {
      console.error('Error adding song:', error);
      if (this.channel) {
        this.channel.send(`Error adding song: ${error.message}`);
      }
      throw error;
    }
  }
  addConvert(songArray) {
    this.convertQueue.push(songArray)
    return this.convertQueue
  }
  setRepeat(repeat) {
    this.repeat = repeat
    return this.repeat
  }
  setNextSong() {
    switch (this.repeat) {
      case repeatStates.REPEAT_ALL:
        if (this.queueIndex + 1 >= this.queue.length) {
          return this.queueIndex = 0;
        }
        return this.queueIndex++;
      case repeatStates.REPEAT_OFF:
        return this.queueIndex++;
    }
  }
  convertFinished() {
    this.convertQueue = this.convertQueue.slice(1)
    return this.convertQueue
  }
  async joinChannel(channel) {
    if (!channel) {
      throw new Error('No voice channel provided. Please join a voice channel first.');
    }

    // Debug: log channel type and properties
    console.log('Channel object:', {
      id: channel.id,
      name: channel.name,
      type: channel.type,
      channelType: channel.constructor?.name,
      guildId: channel.guild?.id
    });

    // Check if this is a valid voice channel
    if (channel.type !== 2) { // Voice channel type is 2 in Discord.js v14
      if (channel.type === 13) { // Stage channel type
        throw new Error('Stage channels are not supported. Please join a regular voice channel.');
      }
      throw new Error(`Cannot join this channel type (${channel.type || 'unknown'}). Please join a regular voice channel (type 2).`);
    }

    // Check if we're already in this channel
    if (this.botChannel && channel.id === this.botChannel.id) {
      console.log(`Already in voice channel: ${channel.name} (${channel.id})`);
      return this.player;
    }

    try {
      // Get the client from state
      const client = this.channel?.client || (state && state.client);
      if (!client || !client.shoukaku) {
        throw new Error('Shoukaku client not available. Bot may still be starting up.');
      }

      // Join voice channel using Shoukaku
      const player = await client.shoukaku.createPlayer(
        channel.guild.id,
        channel.id,
        this.channel?.id
      );

      this.player = player;
      this.botChannel = channel;
      this.connection = player.connection; // For compatibility

      console.log(`Successfully joined voice channel via Lavalink: ${channel.name} (${channel.id})`);
      return player;
    } catch (error) {
      console.error('Error joining voice channel via Lavalink:', error);

      // Provide more helpful error messages
      if (error.message.includes('Target is not a voice channel')) {
        throw new Error('The channel you are in is not a voice channel. Please join a proper voice channel.');
      } else if (error.message.includes('Missing Access') || error.message.includes('Missing Permissions')) {
        throw new Error('I don\'t have permission to join that voice channel. Please check my permissions.');
      } else if (error.message.includes('Already connected')) {
        throw new Error('I\'m already connected to a voice channel in this server.');
      } else if (error.message.includes('Shoukaku client not available')) {
        throw new Error('Audio system is still starting up. Please try again in a few seconds.');
      } else {
        throw new Error(`Failed to join voice channel: ${error.message}`);
      }
    }
  }
  commonLeave() {
    // Destroy player if it exists
    if (this.player) {
      try {
        const client = this.channel?.client || (state && state.client);
        if (client && client.shoukaku) {
          client.shoukaku.destroyPlayer(this.id);
        }
      } catch (error) {
        console.error('Error destroying player:', error);
      }
      this.player = null;
    }

    this.dispatcher = null;
    this.connection = null;
    this.botChannel = null;
    this.audioPlayer = null;

    // Also clear queue state
    songControls.stopSongs(this);
  }
  leaveChannel() {
    if (this.player) {
      const client = this.channel?.client || (state && state.client);
      if (client && client.shoukaku) {
        client.shoukaku.destroyPlayer(this.id);
      }
      this.player = null;
      this.connection = null;
      this.botChannel = null;
    }
    return;
  }

  addTimer() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
    if (!this.botChannel) return;
    this.timeOut = setTimeout(() => {
      this.leaveChannel()
      this.channel.send(`Left the channel due to inactivity`);
    }, 1000 * 60 * process.env.TIMEOUT_MINUTES)

    return;
  }

  removeTimer() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
    return;
  }
  shuffleQueue() {
    if (this.queue.length <= 1) {
      if (this.channel) {
        this.channel.send(`Queue is too small to shuffle.`);
      }
      return;
    }

    // Keep current playing song at its position if possible
    let shuffled;
    if (this.queueIndex >= 0 && this.queueIndex < this.queue.length) {
      const currentSong = this.queue[this.queueIndex];
      const otherSongs = this.queue.filter((_, index) => index !== this.queueIndex);
      const shuffledOthers = fyShuffle(otherSongs);
      shuffled = [...shuffledOthers.slice(0, this.queueIndex), currentSong, ...shuffledOthers.slice(this.queueIndex)];
    } else {
      shuffled = fyShuffle(this.queue);
    }

    this.queue = shuffled;
    if (this.channel) {
      this.channel.send(`The queue has been shuffled.`);
    }
  }

  clearQueue() {
    const removedCount = this.queue.length;
    this.queue = [];
    this.queueIndex = -1;
    if (this.channel) {
      this.channel.send(`Cleared ${removedCount} songs from the queue.`);
    }
    return removedCount;
  }

  removeSong(position) {
    if (position < 1 || position > this.queue.length) {
      throw new Error(`Invalid position: ${position}. Queue has ${this.queue.length} songs.`);
    }

    const index = position - 1;
    const removedSong = this.queue[index];

    // Adjust queue index if we're removing a song before or at the current position
    if (index <= this.queueIndex && this.queueIndex > -1) {
      this.queueIndex--;
    }

    this.queue.splice(index, 1);

    if (this.channel) {
      this.channel.send(`Removed **\`${removedSong.name || removedSong.url}\`** from the queue.`);
    }

    return removedSong;
  }
  setNightcore(nightcoreLevel) {
    this.nightcore = nightcoreLevel
    if (nightcoreLevel === false) {
      return this.channel.send(`Nightcore mode is now off`)
    } else {
      return this.channel.send(`Nightcore mode is now on level ${nightcoreLevel}`)
    }
  }
  savePlaylist = async (playlistName) => {
    if (!this.queue.length > 0) {
      return this.channel.send('There is nothing to save.')
    }
    if (!playlistName) {
      return this.channel.send('Provide a name for the playlist.')
    }
    let guild

    guild = await Guild.findOne({
      guild_id: this.id
    })

    if (!guild) {
      guild = await Guild.create({
        guild_id: this.id
      })
    }

    let playlist

    try {
      playlist = await Playlist.create({
        name: playlistName,
        tracks: this.queue,
        guild_instance: guild
      })
    } catch (error) {
      return this.channel.send(`There was an error saving this playlist. You might already have a playlist saved with that name.`)
    }
    this.channel.send(`Saved playlist with name \`${playlist.name}\` and ${this.queue.length} tracks.`)
  }
  deletePlaylist = async (playlistName) => {
    if (!playlistName) {
      return this.channel.send('Provide a name for the playlist.')
    }

    let playlist

    try {
      playlist = await Playlist.findOneAndDelete({
        name: playlistName,
      })
    } catch (error) {
      return this.channel.send(`There was an error deleting this playlist. You might already have a playlist saved with that name.`)
    }
    this.channel.send(`Deleted playlist with name \`${playlist.name}\` and ${playlist.tracks.length} tracks.`)
  }
  playPlaylist = async (playlistName, message) => {
    const guild = await Guild.findOne({
      guild_id: this.id
    })
    const playlist = await Playlist.findOne({
      $and: [
        { name: playlistName },
        { guild_instance: guild }
      ]
    });
    if (playlist) {
      const queueItems = this.queue.length
      this.queue = [...this.queue, ...playlist.tracks]
      this.channel.send(`Added \`${playlist.tracks.length}\`tracks from playlist \`${playlist.name}\` to the queue`)
      await this.joinChannel(message.member.voice.channel)
      if (queueItems === 0) {
        songControls.nextSong(this);
      }
    } else {
      return this.channel.send(`Playlist not found`)
    }
  }
  changeQuality = async (quality) => {
    let guild = await Guild.findOne({
      guild_id: this.id
    })

    if (!guild) {
      guild = await Guild.create({
        guild_id: this.id,
        quality: quality
      })
    }
    guild = await Guild.findOneAndUpdate({
      guild_id: this.id
    }, { quality })
    this.quality = quality
    return this.channel.send(`Quality changed to ${guild.quality}kbps.`);
  }
  showPlaylists = async () => {
    const guild = await Guild.findOne({
      guild_id: this.id
    })
    const playlists = await Playlist.find({ guild_instance: guild });
    this.channel.send(`Here are the currently saved playlists: `)
    playlists.forEach(pl => {
      this.channel.send(`\`${pl.name}\` with ${pl.tracks.length} tracks.`)
    })
  }

  showQueue = (page = Math.floor((this.queueIndex) / 10) + 1) => {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(this.queue.length / itemsPerPage);

    if (page < 1 || page > totalPages) {
      page = 1;
    }

    const queueSlice = this.queue.slice((page * itemsPerPage) - itemsPerPage, page * itemsPerPage);

    let queueText = `Showing page **\`${page}\`** of **\`${totalPages}\`**\n\n`;

    if (queueSlice.length === 0) {
      queueText += "Queue is empty.";
    } else {
      queueText += queueSlice.map((song, index) => {
        const globalIndex = index + ((page - 1) * itemsPerPage);
        const isCurrent = globalIndex === this.queueIndex;
        const position = globalIndex + 1;

        let line = `\`[${position}]\``;
        if (isCurrent) {
          line += " **▶️";
        }

        line += ` ${song.name || song.url}`;

        if (isCurrent) {
          line += "**";
        }

        if (song.addedBy) {
          line += ` (added by **${song.addedBy.name}**)`;
        }

        return line;
      }).join('\n');
    }

    // Add current playback status if a song is playing
    if (this.playing && this.queueIndex >= 0 && this.queueIndex < this.queue.length) {
      const currentSong = this.queue[this.queueIndex];
      queueText += `\n\n**Now Playing:** ${currentSong.name || currentSong.url}`;

      if (this.nightcore) {
        queueText += ` 🎵 (Nightcore level ${this.nightcore})`;
      }

      if (this.repeat) {
        const repeatText = this.repeat === 1 ? '🔂 (Repeat All)' : '🔁 (Repeat One)';
        queueText += ` ${repeatText}`;
      }
    }

    if (this.channel) {
      this.channel.send(queueText);
    }
  }

  getCurrentSong() {
    if (this.queueIndex >= 0 && this.queueIndex < this.queue.length) {
      return this.queue[this.queueIndex];
    }
    return null;
  }

  getQueueStatus() {
    const currentSong = this.getCurrentSong();
    const queueLength = this.queue.length;
    const position = this.queueIndex + 1;

    return {
      isPlaying: this.playing,
      currentSong,
      position,
      queueLength,
      nightcore: this.nightcore,
      repeat: this.repeat,
      quality: this.quality,
      volume: this.volume || 1.0
    };
  }

  getQueueInfo() {
    const status = this.getQueueStatus();
    let info = `**Queue Status:**\n`;

    if (status.isPlaying && status.currentSong) {
      info += `▶️ Playing: **${status.currentSong.name || status.currentSong.url}**\n`;
      info += `Position: ${status.position}/${status.queueLength}\n`;
    } else {
      info += `⏸️ Not playing\n`;
    }

    if (status.queueLength > 0) {
      info += `Songs in queue: ${status.queueLength}\n`;
    }

    if (status.nightcore) {
      info += `Nightcore: Level ${status.nightcore}\n`;
    }

    if (status.repeat) {
      info += `Repeat: ${status.repeat === 1 ? 'All' : 'One'}\n`;
    }

    info += `Quality: ${status.quality}kbps\n`;
    info += `Volume: ${Math.round(status.volume * 100)}%`;

    return info;
  }
}

class ServerState {
  constructor() {
    Guild.find().then(guilds => {
      this.servers = {}
      guilds.forEach(guild => {
        this.servers[guild.guild_id] = new Server({
          id: guild.guild_id,
          quality: guild.quality,
        })
      })
      this.client = null
      this.prefix = process.env.PREFIX || "#"
    })
  }

  add(serverID, serverOptions) {
    this.servers[serverID] = new Server({ id: serverID, ...serverOptions })
  }

  get(serverID) {
    return this.servers[serverID]
  }

}

const state = new ServerState()

export { state, Server }