module.exports = {
  name: 'sp',
  aliases: ['save'],
  description: 'Saves the current playing songs.',
  args: true,
  usage: "#sp `playlist name`",
  execute(server, message, args) {
    server.savePlaylist(args[0], message)
  }
};
