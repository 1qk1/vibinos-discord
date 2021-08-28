const { state } = require('../utils/servers')

module.exports = {
  name: 'quality',
  description: 'Change the bot voice quality. Available options are low(48kbps), medium(64kbps), high(96kbps).',
  usage: `${state.prefix}quality \`high\`, ${state.prefix}quality \`medium\``,
  execute(server, message, qualityArray) {
    const quality = qualityArray[0]
    const qualityMap = {
      low: 48,
      medium: 64,
      high: 96,
      48: "low",
      64: "medium",
      96: "high"
    }
    if (qualityMap[quality]) {
      return server.changeQuality(qualityMap[quality], message)
    } else {
      return message.channel.send(`Quality is set to ${qualityMap[server.quality]}(${server.quality}kbps).`);
    }
  }
};
