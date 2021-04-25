const { Client, Collection } = require("discord.js");
const { readdirSync } = require('fs');
const { join } = require('path');

const client = new Client({ disableMentions: "everyone" });

client.commands = new Collection();

const commandFiles = readdirSync(join(__dirname, '../', 'commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(join(__dirname, '../', 'commands', `${file}`));
  client.commands.set(command.name, command);
}

module.exports = client