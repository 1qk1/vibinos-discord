export default {
  name: "join",
  description: "Join the user's voice channel",
  needsVoiceChannel: true,
  async execute(server, message) {
    const voiceChannel = message.member?.voice?.channel;

    if (!voiceChannel) {
      return server.channel.send("You need to be in a voice channel for me to join!");
    }

    try {
      await server.channel.send("Coming.");
      await server.joinChannel(voiceChannel);
      await server.channel.send(`Joined ${voiceChannel.name}!`);
    } catch (error) {
      console.error('Error joining voice channel:', error);
      await server.channel.send(`Failed to join voice channel: ${error.message}`);
    }
  }
};
