const Playlist = require('../models/playlist')
const Guild = require('../models/guild')
const songControls = require('../utils/songControls')

class Server {
  constructor({
    id,
    convertQueue = [],
    queue = [],
    fullPlaylist = [],
    dispatcher = null,
    connection = null,
    channel = null,
    botChannel = null,
    timeOut = null,
    shuffle = false
  } = {}) {
    this.id = id
    this.convertQueue = convertQueue
    this.queue = queue
    this.fullPlaylist = fullPlaylist
    this.dispatcher = dispatcher
    this.connection = connection
    this.channel = channel
    this.botChannel = botChannel
    this.timeOut = timeOut
    this.shuffle = shuffle
    this.savePlaylist.bind(this)
    this.playPlaylist.bind(this)
  }
  addSong(song) {
    this.queue.push(song)
    this.fullPlaylist.push(song)
    return this.queue;
  }
  addConvert(songArray) {
    this.convertQueue.push(songArray)
    return this.convertQueue
  }
  convertFinished() {
    this.convertQueue = this.convertQueue.slice(1)
    return this.convertQueue
  }
  joinChannel(channel) {
    return channel.join().then(connection => {
      this.connection = connection;
      this.botChannel = channel;
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
  toggleShuffle(message) {
    const newShuffle = !this.shuffle
    this.shuffle = newShuffle
    const STATEMAP = {
      true: "on",
      false: "off"
    }
    message.channel.send(`Shuffle is now ${STATEMAP[newShuffle]}`)
  }
  savePlaylist = async (playlistName, message) => {
    if (!this.fullPlaylist.length > 0) {
      return message.channel.send('There is nothing to save.')
    }
    if (!playlistName) {
      return message.channel.send('Provide a name for the playlist.')
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
        tracks: this.fullPlaylist,
        guild_instance: guild
      })
    } catch (error) {
      console.log(error)
      return message.channel.send(`There was an error saving this playlist. You might already have a playlist saved with that name.`)
    }
    message.channel.send(`Saved playlist with name \`${playlist.name}\` and ${this.fullPlaylist.length} tracks.`)
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
    const queueItems = this.queue.length
    this.queue = [...this.queue, ...playlist.tracks]
    this.fullPlaylist = [...this.fullPlaylist, ...playlist.tracks]
    message.channel.send(`Added \`${playlist.tracks.length}\`tracks from playlist \`${playlist.name}\` to the queue`)
    await this.joinChannel(message.member.voice.channel)
    if (queueItems === 0) {
      songControls.nextSong(this, message);
    }
  }
  showPlaylists = async (message) => {
    const guild = await Guild.findOne({
      guild_id: this.id
    })
    const playlists = await Playlist.find({ guild_instance: guild });
    message.channel.send(`Here are the currently saved playlists: `)
    playlists.forEach(pl => {
      message.channel.send(`\`${pl.name}\` with ${pl.tracks.length} tracks.`)
    })
  }
}

class ServerState {
  constructor(client) {
    this.servers = {}
    this.client = client
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