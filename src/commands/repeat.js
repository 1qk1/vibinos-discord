const { state } = require('../utils/servers')
const { repeat: repeatStates, repeatArray: repeatStatesArray } = require('../utils/variables')

module.exports = {
  name: 'repeat',
  description: 'Turns repeat mode between single songs, all songs, off.',
  usage: `\`${state.prefix}repeat all\`, \`${state.prefix}repeat single\` or \`${state.prefix}repeat off\`.`,
  execute(server, message, repeatMode) {
    let repeat = repeatMode[0]
    if (repeat) {
      repeat = String(repeat).toUpperCase()
    } else {
      return server.channel.send(`Repeat mode is set to \`${server.repeat.toLowerCase()}\``);
    }
    if (repeatStatesArray.REPEAT_ALL_ARRAY.includes(repeat)) {
      server.setRepeat(repeatStates.REPEAT_ALL, message);
      return server.channel.send("Repeat mode is set to `all`");
    }
    if (repeatStatesArray.REPEAT_SINGLE_ARRAY.includes(repeat)) {
      server.setRepeat(repeatStates.REPEAT_SINGLE, message);
      return server.channel.send("Repeat mode is set to `single` song");
    }
    if (repeatStatesArray.REPEAT_OFF_ARRAY.includes(repeat)) {
      server.setRepeat(repeatStates.REPEAT_OFF, message);
      return server.channel.send("Repeat mode is set to `off`");
    }
  }
};
