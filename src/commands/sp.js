import { state } from '../utils/models/servers.js';


export default {
  name: 'sp',
  aliases: ['save'],
  description: 'Saves the current playing songs.',
  args: true,
  usage: `${state.prefix}sp \`playlist name\``,
  execute(server, message, args) {
    server.savePlaylist(args[0], message)
  }
};
