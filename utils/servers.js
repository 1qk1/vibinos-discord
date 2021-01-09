class Server {
  constructor({
    convertQueue = [], 
    queue = [], 
    timeout = null, 
    dispatcher = null, 
    connection = null,
    channel = null
  } = {}) {
      this.convertQueue = convertQueue
      this.queue = queue
      this.timeout = timeout
      this.dispatcher = dispatcher
      this.connection = connection
      this.channel = channel
  }
  addSong(song){
    this.queue.push(song)
  }
  addConvert(songArray){
    this.convertQueue.push(songArray)
  }
  setTimeout(timeoutID){
    this.timeout = timeoutID
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