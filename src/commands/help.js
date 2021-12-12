const { MessageEmbed } = require("discord.js");
const { state } = require('../utils/servers')
const client = require('../utils/client')

module.exports = {
  name: "help",
  aliases: ["h"],
  description: "Display all commands and descriptions",
  execute(server, message) {
    let commands = client.commands.array();

    let helpEmbed = new MessageEmbed()
      .setTitle(`${message.client.user.username} Help`)
      .setDescription("List of all the commands")
      .setColor("#a689e0");

    commands.forEach((cmd) => {
      helpEmbed.addField(
        `**${state.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases})` : ""}**`,
        `${cmd.description}`,
        true
      );
    });

    helpEmbed.setTimestamp();

    return server.channel.send(helpEmbed).catch(console.error);
  }
};