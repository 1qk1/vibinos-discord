module.exports = {
  name: 'pp',
  description: 'Play a saved playlist.',
  args: true,
  usage: "#pp `playlist name`",
  needsVoiceChannel: true,
  execute(server, message, args) {
    return server.playPlaylist(args[0], message)
  }
};
