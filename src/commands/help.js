import { EmbedBuilder } from "discord.js";
import { state } from '../utils/models/servers.js'
import client from '../utils/client.js'

export default {
  name: "help",
  aliases: ["h"],
  description: "Display all commands and descriptions",
  execute(server, message) {
    console.log("help command executed");
    let commands = Array.from(client.commands?.values() || []);

    // Filter to unique commands (remove aliases)
    const uniqueCommands = [];
    const seen = new Set();
    commands.forEach((cmd) => {
      if (!seen.has(cmd.name)) {
        seen.add(cmd.name);
        uniqueCommands.push(cmd);
      }
    });

    let helpEmbed = new EmbedBuilder()
      .setTitle(`${message.client.user.username} Help`)
      .setDescription("List of all the commands")
      .setColor("#a689e0");

    uniqueCommands.forEach((cmd) => {
      helpEmbed.addFields({
        name: `**${state.prefix}${cmd.name} ${cmd.aliases ? `(${cmd.aliases.join(', ')})` : ""}**`,
        value: `${cmd.description || 'No description'}`,
        inline: true
      });
    });

    helpEmbed.setTimestamp();

    return server.channel.send({ embeds: [helpEmbed] }).catch(console.error);
  }
};