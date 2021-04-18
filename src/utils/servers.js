class Server {
  constructor({
    convertQueue = [],
    queue = [],
    dispatcher = null,
    connection = null,
    channel = null,
    botChannel = null,
    timeOut = null
  } = {}) {
    this.convertQueue = convertQueue
    this.queue = queue
    this.dispatcher = dispatcher
    this.connection = connection
    this.channel = channel
    this.botChannel = botChannel
    this.timeOut = timeOut
  }
  addSong(song) {
    this.queue.push(song)
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
}

class ServerState {
  constructor(client) {
    this.servers = {}
    this.client = client
  }

  add(serverID, serverOptions) {
    this.servers[serverID] = new Server(serverOptions)
  }

  get(serverID) {
    return this.servers[serverID]
  }

}

const state = new ServerState()

module.exports = { state, Server };