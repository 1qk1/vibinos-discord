const Playlist = require('../models/playlist')
const Guild = require('../models/guild')
const songControls = require('../utils/songControls')
const getYoutubeSong = require('./getYT')
const fyShuffle = require('./fisherYatesShuffle')
const { repeat: repeatStates } = require('./variables')
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
    this.playPlaylist.bind(this)
  }
  async addSong(song, sendMessage = true, searchYoutube = true) {
    let songToAdd = song
    if (searchYoutube) {
      songToAdd = await getYoutubeSong(song)
    }
    this.queue.push(songToAdd)
    const songNotPlaying = this.queue.length > 0 && this.queue.length >= this.queueIndex && !this.playing
    if (songNotPlaying) {
      songControls.nextSong(this);
    }
    if (sendMessage) {
      if (songNotPlaying) {
        this.channel.send(`Playing **${songToAdd.name}**. Let's get funky.`);
      } else {
        this.channel.send(`Added **\`${songToAdd.name}\`** to the queue.`);
      }
    }
    return this.queue;
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
        if (server.queue.length > server.queueIndex) {
          return server.queueIndex++;
        }
        return server.queueIndex = 0;
      case repeatStates.REPEAT_OFF:
        return server.queueIndex++;
    }
  }
  convertFinished() {
    this.convertQueue = this.convertQueue.slice(1)
    return this.convertQueue
  }
  joinChannel(channel) {
    return channel.join().then(connection => {
      this.connection = connection;
      this.botChannel = channel;
      const removeListenerFunction = () => {
        songControls.stopSongs(this);
        connection.removeListener('disconnect', removeListenerFunction);
      }
      connection.on('disconnect', removeListenerFunction)
      return connection
    });
  }
  leaveChannel() {
    this.botChannel.leave();
    this.connection = null;
    this.botChannel = null;
    return;
  }

  addTimer() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
    if (!this.botChannel) return;
    this.timeOut = setTimeout(() => () => {
      botChannel.leave()
    }, 1000 * 60 * 10)

    return;
  }

  stopTimer() {
    if (this.timeOut) {
      clearTimeout(this.timeOut)
    }
    return;
  }
  shuffleQueue() {
    const shuffled = [this.queue[0], ...fyShuffle(this.queue.slice(1))]
    this.queue = shuffled
    this.channel.send(`The queue has been shuffled.`)
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
    const itemsPerPage = 10
    this.channel.send(
      `
Showing page **\`${page}\`** of **\`${Math.ceil(this.queue.length / itemsPerPage)}\`**

${this.queue.slice((page * itemsPerPage) - itemsPerPage, page * itemsPerPage).map((song, index) => {
        const isCurrent = index + ((page - 1) * 10) === (this.queueIndex)
        return `\`[${index + 1 + ((page * itemsPerPage) - itemsPerPage)}]\`${isCurrent ? " **▶️" : ""} ${song.name || song.url}${isCurrent ? " **" : ""}`
      }).join('\n')}
`)
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

module.exports = { state, Server };