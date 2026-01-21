import { state } from '../utils/models/servers.js'

export default {
  name: 'dp',
  aliases: ['delete'],
  description: 'Deletes a saved playlist.',
  args: true,
  usage: `${state.prefix}dp \`playlist name\``,
  execute(server, message, args) {
    server.deletePlaylist(args[0], message)
  }
};
