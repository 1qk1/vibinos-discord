const { Guild, Playlist } = require('../models')
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
    const [guild, created] = await Guild.findOrCreate({
      where: { guild_id: this.id }
    })
    const playlist = await Playlist.create({
      name: playlistName,
      tracks: this.fullPlaylist,
      guild_instance: String(guild.guild_id)
    })
    message.channel.send(`Saved playlist with name \`${playlist.name}\` and ${this.fullPlaylist.length} tracks.`)
  }
  playPlaylist = async (playlistName, message) => {
    const playlist = await Playlist.findOne({ where: { name: playlistName } });
    const queueItems = this.queue.length
    this.queue = [...this.queue, ...playlist.tracks]
    this.fullPlaylist = [...this.fullPlaylist, ...playlist.tracks]
    message.channel.send(`Added tracks from playlist \`${playlist.name}\` to the queue`)
    await this.joinChannel(message.member.voice.channel)
    if (queueItems === 0) {
      songControls.nextSong(this, message);
    }
  }
  showPlaylists = async (message) => {
    const playlists = await Playlist.findAll({ where: { guild_instance: String(this.id) } });
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