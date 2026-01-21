export default {
  name: 'nightcore',
  description: 'Turns nightcore mode on or off',
  execute(server, message, nightcoreLevel) {
    const level = parseInt(nightcoreLevel[0])
    if (!nightcoreLevel[0]) {
      if (server.nightcore) {
        return server.setNightcore(false, message);
      } else {
        return server.setNightcore(1, message);
      }
    }
    if (level !== NaN && level >= 1 && level <= 3) {
      return server.setNightcore(nightcoreLevel, message);
    }
    return server.channel.send("Nightcore level can be 1 - 3 or leave it blank to turn it off");
  }
};
