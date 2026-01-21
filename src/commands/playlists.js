export default {
  name: 'playlists',
  description: 'Show all saved playlists.',
  execute(server, message) {
    return server.showPlaylists(message)
  }
};
