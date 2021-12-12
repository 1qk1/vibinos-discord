// now playing

module.exports = {
  name: 'np',
  aliases: ['playing', 'nowplaying'],
  description: 'Show the currently playing song.',
  execute(server) {
    if (server.queue.length && server.playing && server.queueIndex > -1) {
      return server.channel.send(`Now playing: **▶️\`${server.queue[server.queueIndex].name}\`**`)
    }
  }
};
