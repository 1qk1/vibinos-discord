class Server {
  constructor({
    convertQueue = [],
    queue = [],
    dispatcher = null,
    connection = null,
    channel = null,
    botChannel = null
  } = {}) {
      this.convertQueue = convertQueue
      this.queue = queue
      this.dispatcher = dispatcher
      this.connection = connection
      this.channel = channel
      this.botChannel = botChannel
  }
  addSong(song){
    this.queue.push(song)
    return this.queue;
  }
  addConvert(songArray){
    this.convertQueue.push(songArray)
    return this.convertQueue
  }
  convertFinished(){
    this.convertQueue = this.convertQueue.slice(1)
    return this.convertQueue
  }
}

class ServerState {
  constructor(client) {
    this.servers = {}
    this.client = client
  }

  add(serverID, serverOptions){
    this.servers[serverID] = new Server(serverOptions)
  }
  
  get(serverID){
    return this.servers[serverID]
  }

}

const state = new ServerState()

module.exports = {state, Server};