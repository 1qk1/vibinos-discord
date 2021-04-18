const { MessageEmbed } = require("discord.js");

const helpHandler = (message) => {
  const helpMessages = [
    ["#play", "Play a song from youtube, a youtube playlist or a spotify playlist. It can search by name or you can provide it with the link"],
    ["#stop", "Stops all playing songs in the queue."],
    ["#skip", "Skips to the next song in the queue."],
    ["#shuffle", "Turns shuffle on or off."],
    ["#join", "Makes the bot join your voice channel."],
    ["#leave", "Makes the bot leave your voice channel."],
    ["#help", "This command."],
  ]
  let helpEmbed = new MessageEmbed()
    .setTitle(`${message.client.user.username} Help`)
    .setDescription("List of all commands")
    .setColor("#F8AA2A");

  helpMessages.forEach(([command, description]) => {
    helpEmbed.addField(
      `**${command}**`,
      `${description}`,
      true
    );
  });
  helpEmbed.setTimestamp();

  return message.channel.send(helpEmbed).catch(console.error);
}

module.exports = helpHandler


